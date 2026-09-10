"use strict";

const DEFAULT_FALLBACK_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "deepseek/deepseek-chat",
];

function getFallbackModels() {
  let models = [];
  if (process.env.OPENROUTER_MODELS) {
    models = process.env.OPENROUTER_MODELS.split(",").map((m) => m.trim()).filter(Boolean);
  } else if (process.env.OPENROUTER_MODEL) {
    const userModels = process.env.OPENROUTER_MODEL.split(",").map((m) => m.trim()).filter(Boolean);
    models = Array.from(new Set([...userModels, ...DEFAULT_FALLBACK_MODELS]));
  } else {
    models = DEFAULT_FALLBACK_MODELS;
  }
  // OpenRouter enforces that the 'models' array must contain 3 items or fewer
  return models.slice(0, 3);
}

function getSafeMaxTokens() {
  const configured = Number(process.env.OPENROUTER_MAX_TOKENS || 2500);
  if (isNaN(configured) || configured <= 0) return 2500;
  // Strictly enforce 2000–3000 range to prevent OpenRouter upfront 402 credit reservation errors
  return Math.min(Math.max(configured, 2000), 3000);
}

// Recursively remove keys Gemini/OpenRouter doesn't accept in responseSchema
function sanitizeSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;
  const { additionalProperties, default: _default, examples, title, ...rest } = schema;
  const out = { ...rest };
  if (out.properties && typeof out.properties === "object") {
    const cleanedProps = {};
    for (const [k, v] of Object.entries(out.properties)) {
      cleanedProps[k] = sanitizeSchema(v);
    }
    out.properties = cleanedProps;
  }
  if (out.items) out.items = sanitizeSchema(out.items);
  if (out.anyOf) out.anyOf = out.anyOf.map(sanitizeSchema);
  if (out.oneOf) out.oneOf = out.oneOf.map(sanitizeSchema);
  if (out.allOf) out.allOf = out.allOf.map(sanitizeSchema);
  return out;
}

/**
 * generateJson
 * Use OpenRouter with automatic model fallback routing and application/json output.
 * Params:
 * - system: string (system instruction)
 * - user: string|object (payload; stringified if object)
 * - schema: optional schema (subset) to shape output
 */
async function generateJson({ system, user, schema, models: customModels }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OpenRouter API key. Please set OPENROUTER_API_KEY in your BackEnd/.env file.",
    );
  }

  const userText = typeof user === "string" ? user : JSON.stringify(user ?? {});
  const cleanedSchema = schema ? sanitizeSchema(schema) : undefined;

  const models = (customModels && Array.isArray(customModels) && customModels.length > 0)
    ? customModels.slice(0, 3)
    : getFallbackModels();
  const temperature = process.env.OPENROUTER_TEMPERATURE || process.env.GEMINI_TEMPERATURE
    ? Number(process.env.OPENROUTER_TEMPERATURE || process.env.GEMINI_TEMPERATURE)
    : 0.7;
  const maxTokens = getSafeMaxTokens();

  const payload = {
    models,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userText },
    ],
    // Force JSON output
    response_format: { type: "json_object" },
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_ORIGIN || "http://localhost:5173",
        "X-Title": "AI Resume Builder",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errText);
      } catch (_) {}

      const statusCode = response.status;
      const errorMsg = errorData?.error?.message || errText;
      const errorCode = errorData?.error?.code || statusCode;

      if (statusCode === 402 || errorCode === 402) {
        throw new Error(
          `OpenRouter Credit Error (402): Account balance depleted or requested token reserve exceeded. Please reduce max_tokens or purchase credits at https://openrouter.ai/settings/credits. OpenRouter message: "${errorMsg}"`,
        );
      }

      if (statusCode === 429 || errorCode === 429) {
        throw new Error(
          `OpenRouter Rate Limit (429): All fallback models (${models.join(", ")}) are temporarily rate-limited. Please retry shortly. OpenRouter message: "${errorMsg}"`,
        );
      }

      throw new Error(`OpenRouter API error: ${statusCode} - ${errorMsg}`);
    }

    const data = await response.json();
    const usedModel = data?.model || data?.choices?.[0]?.model || "unknown";
    console.log(`🤖 OpenRouter completion successful via model: "${usedModel}"`);

    const finishReason = data?.choices?.[0]?.finish_reason;
    let text = data?.choices?.[0]?.message?.content || "";

    if (finishReason === "length") {
      console.warn("⚠️ OpenRouter warning: generation hit max_tokens limit and was truncated.");
    }

    // Strip out <think>...</think> blocks from reasoning models (DeepSeek, etc.)
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Clean up potential markdown JSON block
    let jsonText = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    // Best-effort cleanup of trailing commas
    jsonText = jsonText.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      // 1. Attempt to find JSON object bounds
      const start = jsonText.indexOf("{");
      const end = jsonText.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(jsonText.slice(start, end + 1));
        } catch (_) {}
      }

      // 2. Attempt to repair truncated JSON
      try {
        const repaired = repairTruncatedJson(jsonText.slice(Math.max(0, start)));
        return JSON.parse(repaired);
      } catch (_) {}

      const excerpt = jsonText.slice(0, 250).replace(/\s+/g, " ");
      throw new Error(`Failed to parse JSON response. Excerpt: ${excerpt}`);
    }
  } catch (error) {
    console.error("Error generating content with OpenRouter:", error);
    throw error;
  }
}

function repairTruncatedJson(str) {
  let inString = false;
  let isEscaped = false;
  const stack = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === "\\") {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        if (stack.length && stack[stack.length - 1] === "{") stack.pop();
      } else if (char === "]") {
        if (stack.length && stack[stack.length - 1] === "[") stack.pop();
      }
    }
  }

  let repaired = str;
  if (inString) repaired += '"';
  repaired = repaired.trim().replace(/,\s*$/, "");
  while (stack.length > 0) {
    const open = stack.pop();
    repaired = repaired.trim().replace(/,\s*$/, "");
    if (open === "{") repaired += "}";
    else if (open === "[") repaired += "]";
  }
  return repaired;
}

module.exports = { generateJson, sanitizeSchema };
