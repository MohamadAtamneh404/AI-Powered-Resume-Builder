import React, { useState, useCallback } from "react";
import InlineEdit from "./InlineEdit";
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";

/* ─── Section Toolbar (hover overlay) ─── */
function SectionToolbar({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAiAssist,
  isAiLoading = false,
  upDisabled,
  downDisabled,
}) {
  return (
    <div className="absolute -top-3 right-2 z-20 flex items-center gap-0.5 bg-white border border-black/[0.08] rounded-lg shadow-lg px-1.5 py-0.5 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
      {onAiAssist && (
        <>
          <button
            type="button"
            onClick={onAiAssist}
            disabled={isAiLoading}
            className="p-1 rounded hover:bg-purple-50 text-purple-600 hover:text-purple-800 transition flex items-center gap-1 text-[11px] font-semibold pr-1.5 disabled:opacity-75"
            title="AI Assist for this section"
          >
            {isAiLoading ? (
              <>
                <Loader2 size={12} className="animate-spin text-purple-600" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles size={12} className="text-purple-600" />
                <span>AI Assist</span>
              </>
            )}
          </button>
          <div className="w-px h-3.5 bg-black/[0.08] mx-0.5" />
        </>
      )}
      <button
        type="button"
        onClick={onMoveUp}
        disabled={upDisabled}
        className="p-1 rounded hover:bg-black/[0.04] text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="Move up"
      >
        <ChevronUp size={14} />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={downDisabled}
        className="p-1 rounded hover:bg-black/[0.04] text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
        title="Move down"
      >
        <ChevronDown size={14} />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1 rounded hover:bg-black/[0.04] text-zinc-400 hover:text-zinc-700 transition"
        title="Duplicate"
      >
        <Copy size={14} />
      </button>
      <div className="w-px h-3.5 bg-black/[0.08] mx-0.5" />
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-500 transition"
        title="Delete section"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ─── Layout-Variant-Aware Section Heading ─── */
function SectionHeading({ title, template, onAiAssist, extraAction, isAiLoading = false }) {
  const layoutVariant = template?.layoutVariant || "classic";
  const primaryColor =
    template?.theme?.colors?.primary && template.theme.colors.primary !== "#9fff00"
      ? template.theme.colors.primary
      : "#111827";

  let headingClass = "text-xs font-bold uppercase tracking-widest pb-1 mb-2.5 flex items-center justify-between";
  let headingStyle = {
    borderBottom: `1.5px solid ${primaryColor}`,
    color: primaryColor !== "#111827" ? primaryColor : "#111827",
  };

  if (layoutVariant === "modern") {
    headingClass = "text-xs font-bold uppercase tracking-wider pl-2.5 pb-0.5 mb-2.5 flex items-center justify-between";
    headingStyle = {
      borderLeft: `4px solid ${primaryColor}`,
      color: primaryColor,
    };
  } else if (layoutVariant === "executive") {
    headingClass = "text-center text-xs font-bold uppercase tracking-[0.2em] font-serif py-1 mb-3 flex items-center justify-between";
    headingStyle = {
      borderTop: `1px solid #94a3b8`,
      borderBottom: `1px solid #94a3b8`,
      color: primaryColor !== "#111827" ? primaryColor : "#1e293b",
    };
  } else if (layoutVariant === "developer") {
    headingClass = "text-xs font-bold font-mono tracking-wider pb-1 mb-2.5 flex items-center justify-between";
    headingStyle = {
      borderBottom: `2px solid ${primaryColor}`,
      color: primaryColor,
    };
  } else if (layoutVariant === "compact") {
    headingClass = "text-[11px] font-bold uppercase tracking-wider pb-0.5 mb-1.5 flex items-center justify-between";
    headingStyle = {
      borderBottom: `1px solid #cbd5e1`,
      color: "#0f172a",
    };
  }

  return (
    <div className={headingClass} style={headingStyle}>
      <span className="flex items-center gap-1.5">
        {layoutVariant === "developer" && <span className="opacity-50 text-[10px]">{"//"}</span>}
        <span>{title}</span>
      </span>
      <div className="flex items-center gap-1.5 font-sans normal-case tracking-normal">
        {extraAction}
        {onAiAssist && (
          <button
            type="button"
            onClick={onAiAssist}
            disabled={isAiLoading}
            className="opacity-0 group-hover/section:opacity-100 text-[10px] px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition flex items-center gap-1 disabled:opacity-75"
            title="AI Assist"
          >
            {isAiLoading ? (
              <>
                <Loader2 size={10} className="animate-spin text-purple-600" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles size={10} />
                <span>AI Assist</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}


/* ─── Entry Row Toolbar (appears on entry hover) ─── */
function EntryToolbar({ onDuplicate, onDelete, onAiBullets, isGeneratingBullets = false }) {
  return (
    <div className="absolute -right-1 top-0 z-10 flex items-center gap-0.5 bg-white border border-black/[0.08] rounded-md shadow-md px-0.5 py-0.5 opacity-0 group-hover/entry:opacity-100 transition-opacity">
      {onAiBullets && (
        <button
          type="button"
          onClick={onAiBullets}
          disabled={isGeneratingBullets}
          className="p-1 rounded hover:bg-[#9fff00]/10 text-zinc-400 hover:text-[#1a1a1a] transition disabled:opacity-75"
          title={isGeneratingBullets ? "AI is generating bullets..." : "Generate AI bullets"}
        >
          {isGeneratingBullets ? (
            <Loader2 size={12} className="animate-spin text-purple-600" />
          ) : (
            <Sparkles size={12} />
          )}
        </button>
      )}
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1 rounded hover:bg-black/[0.04] text-zinc-400 hover:text-zinc-700 transition"
        title="Duplicate entry"
      >
        <Copy size={12} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-500 transition"
        title="Remove entry"
      >
        <X size={12} />
      </button>
    </div>
  );
}

/* ─── Bullet List Editor ─── */
function BulletListEditor({ bullets = [], onChange }) {
  const updateBullet = (idx, val) => {
    const next = [...bullets];
    next[idx] = val;
    onChange(next);
  };

  const removeBullet = (idx) => {
    const next = bullets.filter((_, i) => i !== idx);
    onChange(next);
  };

  const addBullet = () => {
    onChange([...bullets, ""]);
  };

  return (
    <div className="mt-1.5 ml-4">
      <ul className="list-disc list-outside space-y-0.5">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="group/bullet relative">
            <InlineEdit
              value={bullet}
              onChange={(val) => updateBullet(idx, val)}
              placeholder="Add an achievement..."
              className="text-[13px] text-gray-800 leading-snug inline"
              multiline={false}
            />
            <button
              type="button"
              onClick={() => removeBullet(idx)}
              className="absolute -right-5 top-0 opacity-0 group-hover/bullet:opacity-100 p-0.5 text-zinc-300 hover:text-red-400 transition"
            >
              <X size={10} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addBullet}
        className="mt-1 text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] flex items-center gap-1 transition"
      >
        <Plus size={10} />
        <span>Add bullet</span>
      </button>
    </div>
  );
}

/* ─── Keyword Chips Editor (for skills) ─── */
function KeywordChipsEditor({ keywords = [], onChange }) {
  const [inputValue, setInputValue] = useState("");

  const addKeyword = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed]);
      setInputValue("");
    }
  };

  const removeKeyword = (idx) => {
    onChange(keywords.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    } else if (e.key === "Backspace" && !inputValue && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {keywords.map((kw, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[11px] group/chip"
        >
          {kw}
          <button
            type="button"
            onClick={() => removeKeyword(idx)}
            className="opacity-0 group-hover/chip:opacity-100 text-zinc-400 hover:text-red-500 transition ml-0.5"
          >
            <X size={8} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addKeyword}
        placeholder="Add skill..."
        className="text-[11px] text-[#1a1a1a] bg-transparent border-none outline-none w-20 placeholder:text-zinc-400"
      />
    </div>
  );
}

/* ─── Header Section ─── */
function HeaderSection({ basics, onBasicsChange, template }) {
  const layoutVariant = template?.layoutVariant || "classic";
  const primaryColor =
    template?.theme?.colors?.primary && template.theme.colors.primary !== "#9fff00"
      ? template.theme.colors.primary
      : "#111827";

  const update = (field, value) => {
    const updated = { ...basics, [field]: value };
    if (field === "linkedin" || field === "github") {
      const l = field === "linkedin" ? value : basics.linkedin || "";
      const g = field === "github" ? value : basics.github || "";
      updated.profiles = [
        l
          ? {
              network: "LinkedIn",
              username: l.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/?/i, "").replace(/\/+$/, ""),
              url: l.startsWith("http") ? l : `https://linkedin.com/in/${l}`,
            }
          : null,
        g
          ? {
              network: "GitHub",
              username: g.replace(/^(https?:\/\/)?(www\.)?github\.com\/?/i, "").replace(/\/+$/, ""),
              url: g.startsWith("http") ? g : `https://github.com/${g}`,
            }
          : null,
      ].filter(Boolean);
    }
    onBasicsChange(updated);
  };

  const updateLocation = (field, value) => {
    onBasicsChange({
      ...basics,
      location: { ...(basics.location || {}), [field]: value },
    });
  };

  const linkedinVal =
    basics.linkedin ??
    (basics.profiles || []).find((p) => p.network?.toLowerCase() === "linkedin")?.username ??
    "";
  const githubVal =
    basics.github ??
    (basics.profiles || []).find((p) => p.network?.toLowerCase() === "github")?.username ??
    "";

  // Layout-variant specific wrapper & styling
  let headerWrapperClass = "pb-4 mb-5 border-b text-center";
  let headerBorderColor = primaryColor !== "#111827" ? primaryColor : "#111827";
  let nameClass = "text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900";
  let contactJustify = "justify-center";

  if (layoutVariant === "executive") {
    headerWrapperClass = "pb-4 mb-5 text-center";
    nameClass = "text-2xl sm:text-3xl font-serif font-bold uppercase tracking-[0.15em] text-gray-900";
    contactJustify = "justify-center font-serif";
  } else if (layoutVariant === "modern") {
    headerWrapperClass = "pb-4 mb-5 text-left border-b-2";
    nameClass = "text-2xl sm:text-3xl font-bold uppercase tracking-tight";
    contactJustify = "justify-start";
  } else if (layoutVariant === "developer") {
    headerWrapperClass = "pb-3.5 mb-4 text-left border-b-2";
    nameClass = "text-2xl sm:text-3xl font-bold font-mono tracking-tight";
    contactJustify = "justify-start font-mono text-[11px]";
  } else if (layoutVariant === "compact") {
    headerWrapperClass = "pb-2 mb-3 text-left border-b";
    nameClass = "text-xl font-bold uppercase tracking-tight text-gray-900";
    contactJustify = "justify-start text-[11px]";
  }

  return (
    <header
      className={headerWrapperClass}
      style={{
        borderBottomColor: headerBorderColor,
        borderBottomStyle: layoutVariant === "executive" ? "double" : "solid",
        borderBottomWidth: layoutVariant === "executive" ? "3px" : undefined,
      }}
    >
      <InlineEdit
        value={basics.name}
        onChange={(v) => update("name", v)}
        placeholder="Your Name"
        tag="h1"
        className={nameClass}
        style={{
          color: (layoutVariant === "modern" || layoutVariant === "developer") && primaryColor !== "#111827"
            ? primaryColor
            : undefined,
        }}
      />
      <InlineEdit
        value={basics.label}
        onChange={(v) => update("label", v)}
        placeholder="Professional Title"
        className={`text-sm font-medium mt-0.5 ${
          layoutVariant === "developer" ? "font-mono text-teal-800" : "text-gray-700"
        }`}
      />
      <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2 text-xs text-gray-700 ${contactJustify}`}>
        {[
          {
            val: basics.email,
            field: "email",
            placeholder: "email@example.com",
            type: "email",
            autoComplete: "email",
          },
          {
            val: basics.phone,
            field: "phone",
            placeholder: "+1 234 567 890",
            type: "tel",
            autoComplete: "tel",
          },
          {
            val: basics.location?.city,
            field: "location.city",
            placeholder: "City",
            type: "text",
            autoComplete: "address-level2",
          },
          {
            val: basics.url,
            field: "url",
            placeholder: "portfolio.com",
            type: "url",
          },
          {
            val: linkedinVal,
            field: "linkedin",
            placeholder: "linkedin.com/in/username",
            type: "text",
          },
          {
            val: githubVal,
            field: "github",
            placeholder: "github.com/username",
            type: "text",
          },
        ].map((item, idx) => (
          <React.Fragment key={item.field}>
            {idx > 0 && <span className="text-gray-400">•</span>}
            <InlineEdit
              value={
                item.field === "location.city"
                  ? basics.location?.city || ""
                  : item.val || ""
              }
              onChange={(v) =>
                item.field === "location.city"
                  ? updateLocation("city", v)
                  : update(item.field, v)
              }
              placeholder={item.placeholder}
              type={item.type}
              autoComplete={item.autoComplete}
              name={item.field}
              id={`resume-${item.field.replace(".", "-")}`}
              className="inline"
            />
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}

/* ─── Summary Section ─── */
function SummarySection({ block, blockIndex, onUpdateBlock, template, onAiAssist, isAiWorking = false }) {
  return (
    <section className={template?.layoutVariant === "compact" ? "mb-3" : "mb-5"}>
      <SectionHeading
        title="Professional Summary"
        template={template}
        onAiAssist={onAiAssist}
        isAiLoading={isAiWorking}
        extraAction={
          <button
            type="button"
            onClick={onAiAssist}
            disabled={isAiWorking}
            className="text-[10px] text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold disabled:opacity-75"
            title="Generate or polish summary with AI"
          >
            {isAiWorking ? (
              <>
                <Loader2 size={11} className="animate-spin text-purple-600" />
                <span>Polishing...</span>
              </>
            ) : (
              <>
                <Sparkles size={11} />
                <span>AI Polish</span>
              </>
            )}
          </button>
        }
      />
      <InlineEdit
        value={block.content || ""}
        onChange={(v) => onUpdateBlock(blockIndex, { content: v })}
        placeholder="Write a compelling professional summary..."
        className={`text-xs text-gray-800 leading-relaxed whitespace-pre-line ${
          template?.layoutVariant === "executive" ? "font-serif text-[12.5px]" : ""
        }`}
        multiline
      />
    </section>
  );
}

/* ─── Work Experience Section ─── */
function WorkSection({
  block,
  blockIndex,
  onUpdateBlock,
  onGenerateBullets,
  template,
  onAiAssist,
  isAiWorking = false,
  aiLoadingEntryIndex = null,
}) {
  const entries = block.entries || [];

  const updateEntry = (entryIdx, patch) => {
    const next = [...entries];
    next[entryIdx] = { ...next[entryIdx], ...patch };
    onUpdateBlock(blockIndex, { entries: next });
  };

  const addEntry = () => {
    onUpdateBlock(blockIndex, {
      entries: [
        ...entries,
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          summary: "",
          highlights: [],
        },
      ],
    });
  };

  const removeEntry = (entryIdx) => {
    onUpdateBlock(blockIndex, {
      entries: entries.filter((_, i) => i !== entryIdx),
    });
  };

  const duplicateEntry = (entryIdx) => {
    const next = [...entries];
    next.splice(entryIdx + 1, 0, JSON.parse(JSON.stringify(entries[entryIdx])));
    onUpdateBlock(blockIndex, { entries: next });
  };

  return (
    <section className={template?.layoutVariant === "compact" ? "mb-3" : "mb-5"}>
      <SectionHeading
        title="Work Experience"
        template={template}
        onAiAssist={onAiAssist}
        isAiLoading={isAiWorking}
        extraAction={
          <button
            type="button"
            onClick={onAiAssist}
            disabled={isAiWorking}
            className="text-[10px] text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold disabled:opacity-75"
            title="Enrich work bullets with metrics & action verbs"
          >
            {isAiWorking ? (
              <>
                <Loader2 size={11} className="animate-spin text-purple-600" />
                <span>Enriching...</span>
              </>
            ) : (
              <>
                <Sparkles size={11} />
                <span>AI Enrich All</span>
              </>
            )}
          </button>
        }
      />

      <div className="space-y-4">
        {entries.map((entry, entryIdx) => {
          const bullets =
            Array.isArray(entry.highlights) && entry.highlights.length > 0
              ? entry.highlights
              : entry.summary
                ? entry.summary.split("\n").filter(Boolean)
                : [];

          return (
            <div key={entryIdx} className="relative group/entry text-xs">
              <EntryToolbar
                onDuplicate={() => duplicateEntry(entryIdx)}
                onDelete={() => removeEntry(entryIdx)}
                isGeneratingBullets={aiLoadingEntryIndex === entryIdx}
                onAiBullets={
                  onGenerateBullets
                    ? () => onGenerateBullets(blockIndex, entryIdx)
                    : undefined
                }
              />
              <div className="flex justify-between items-baseline flex-wrap gap-1">
                <div className="flex items-baseline gap-1">
                  <InlineEdit
                    value={entry.position || ""}
                    onChange={(v) => updateEntry(entryIdx, { position: v })}
                    placeholder="Job Title"
                    tag="span"
                    className="font-bold text-gray-900"
                  />
                  <span className="text-gray-400">|</span>
                  <InlineEdit
                    value={entry.company || ""}
                    onChange={(v) => updateEntry(entryIdx, { company: v })}
                    placeholder="Company"
                    tag="span"
                    className="italic text-gray-800"
                  />
                </div>
                <div className="flex items-baseline gap-1 text-xs font-medium text-gray-700">
                  <InlineEdit
                    value={entry.startDate || ""}
                    onChange={(v) => updateEntry(entryIdx, { startDate: v })}
                    placeholder="Start"
                    tag="span"
                    className="font-medium text-gray-700"
                  />
                  <span>–</span>
                  <InlineEdit
                    value={entry.endDate || ""}
                    onChange={(v) => updateEntry(entryIdx, { endDate: v })}
                    placeholder="End"
                    tag="span"
                    className="font-medium text-gray-700"
                  />
                </div>
              </div>
              <BulletListEditor
                bullets={bullets}
                onChange={(newBullets) =>
                  updateEntry(entryIdx, { highlights: newBullets, summary: "" })
                }
              />
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={addEntry}
        className="mt-3 text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] flex items-center gap-1 transition"
      >
        <Plus size={12} />
        <span>Add position</span>
      </button>
    </section>
  );
}

/* ─── Education Section ─── */
function EducationSection({ block, blockIndex, onUpdateBlock, template, onAiAssist }) {
  const entries = block.entries || [];

  const updateEntry = (entryIdx, patch) => {
    const next = [...entries];
    next[entryIdx] = { ...next[entryIdx], ...patch };
    onUpdateBlock(blockIndex, { entries: next });
  };

  const addEntry = () => {
    onUpdateBlock(blockIndex, {
      entries: [
        ...entries,
        {
          institution: "",
          studyType: "",
          area: "",
          startDate: "",
          endDate: "",
          score: "",
          summary: "",
        },
      ],
    });
  };

  const removeEntry = (entryIdx) => {
    onUpdateBlock(blockIndex, {
      entries: entries.filter((_, i) => i !== entryIdx),
    });
  };

  return (
    <section className={template?.layoutVariant === "compact" ? "mb-3" : "mb-5"}>
      <SectionHeading
        title="Education"
        template={template}
        onAiAssist={onAiAssist}
      />
      <div className="space-y-2.5">
        {entries.map((entry, entryIdx) => (
          <div key={entryIdx} className="relative group/entry text-xs">
            <EntryToolbar
              onDuplicate={() => {
                const next = [...entries];
                next.splice(entryIdx + 1, 0, JSON.parse(JSON.stringify(entry)));
                onUpdateBlock(blockIndex, { entries: next });
              }}
              onDelete={() => removeEntry(entryIdx)}
            />
            <div className="flex justify-between items-baseline flex-wrap gap-1">
              <div className="flex items-baseline gap-1">
                <InlineEdit
                  value={entry.studyType || ""}
                  onChange={(v) => updateEntry(entryIdx, { studyType: v })}
                  placeholder="Degree"
                  tag="span"
                  className="font-bold text-gray-900"
                />
                {(entry.area || true) && (
                  <>
                    <span className="text-gray-600">in</span>
                    <InlineEdit
                      value={entry.area || ""}
                      onChange={(v) => updateEntry(entryIdx, { area: v })}
                      placeholder="Field of Study"
                      tag="span"
                      className="font-bold text-gray-900"
                    />
                  </>
                )}
                <span className="text-gray-400">|</span>
                <InlineEdit
                  value={entry.institution || ""}
                  onChange={(v) => updateEntry(entryIdx, { institution: v })}
                  placeholder="Institution"
                  tag="span"
                  className="italic text-gray-800"
                />
              </div>
              <div className="flex items-baseline gap-1 text-xs font-medium text-gray-700">
                <InlineEdit
                  value={entry.startDate || ""}
                  onChange={(v) => updateEntry(entryIdx, { startDate: v })}
                  placeholder="Start"
                  tag="span"
                />
                <span>–</span>
                <InlineEdit
                  value={entry.endDate || ""}
                  onChange={(v) => updateEntry(entryIdx, { endDate: v })}
                  placeholder="End"
                  tag="span"
                />
              </div>
            </div>
            {(entry.score || true) && (
              <div className="flex items-baseline gap-1 mt-0.5 text-xs text-gray-600">
                <span>GPA:</span>
                <InlineEdit
                  value={entry.score || ""}
                  onChange={(v) => updateEntry(entryIdx, { score: v })}
                  placeholder="—"
                  tag="span"
                  className="text-gray-600"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addEntry}
        className="mt-3 text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] flex items-center gap-1 transition"
      >
        <Plus size={12} />
        <span>Add education</span>
      </button>
    </section>
  );
}

/* ─── Skills Section ─── */
function SkillsSection({ block, blockIndex, onUpdateBlock, template, onAiAssist, isAiWorking = false }) {
  const groups = block.groups || [];

  const updateGroup = (groupIdx, patch) => {
    const next = [...groups];
    next[groupIdx] = { ...next[groupIdx], ...patch };
    onUpdateBlock(blockIndex, { groups: next });
  };

  const addGroup = () => {
    onUpdateBlock(blockIndex, {
      groups: [...groups, { name: "", level: "", keywords: [] }],
    });
  };

  const removeGroup = (groupIdx) => {
    onUpdateBlock(blockIndex, {
      groups: groups.filter((_, i) => i !== groupIdx),
    });
  };

  return (
    <section className={template?.layoutVariant === "compact" ? "mb-3" : "mb-5"}>
      <SectionHeading
        title="Technical & Domain Skills"
        template={template}
        onAiAssist={onAiAssist}
        isAiLoading={isAiWorking}
        extraAction={
          <button
            type="button"
            onClick={onAiAssist}
            disabled={isAiWorking}
            className="text-[10px] text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold disabled:opacity-75"
            title="Suggest skills with AI"
          >
            {isAiWorking ? (
              <>
                <Loader2 size={11} className="animate-spin text-purple-600" />
                <span>Suggesting...</span>
              </>
            ) : (
              <>
                <Sparkles size={11} />
                <span>AI Suggest</span>
              </>
            )}
          </button>
        }
      />
      <div className="text-xs text-gray-800 space-y-1.5">
        {groups.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className="relative group/entry flex items-start gap-1"
          >
            <InlineEdit
              value={group.name || ""}
              onChange={(v) => updateGroup(groupIdx, { name: v })}
              placeholder="Category"
              tag="span"
              className="font-bold text-gray-900 shrink-0"
            />
            <span className="text-gray-900 shrink-0">:</span>
            <div className="flex-1">
              <KeywordChipsEditor
                keywords={group.keywords || []}
                onChange={(kws) => updateGroup(groupIdx, { keywords: kws })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeGroup(groupIdx)}
              className="opacity-0 group-hover/entry:opacity-100 p-0.5 text-zinc-300 hover:text-red-400 transition shrink-0"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addGroup}
        className="mt-2 text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] flex items-center gap-1 transition"
      >
        <Plus size={10} />
        <span>Add skill group</span>
      </button>
    </section>
  );
}

/* ─── Projects Section ─── */
function ProjectsSection({ block, blockIndex, onUpdateBlock, template, onAiAssist }) {
  const entries = block.entries || [];

  const updateEntry = (entryIdx, patch) => {
    const next = [...entries];
    next[entryIdx] = { ...next[entryIdx], ...patch };
    onUpdateBlock(blockIndex, { entries: next });
  };

  const addEntry = () => {
    onUpdateBlock(blockIndex, {
      entries: [
        ...entries,
        { name: "", description: "", url: "", technologies: [] },
      ],
    });
  };

  const removeEntry = (entryIdx) => {
    onUpdateBlock(blockIndex, {
      entries: entries.filter((_, i) => i !== entryIdx),
    });
  };

  return (
    <section className={template?.layoutVariant === "compact" ? "mb-3" : "mb-5"}>
      <SectionHeading
        title="Key Projects"
        template={template}
        onAiAssist={onAiAssist}
      />
      <div className="space-y-2.5">
        {entries.map((entry, entryIdx) => (
          <div key={entryIdx} className="relative group/entry text-xs">
            <EntryToolbar
              onDuplicate={() => {
                const next = [...entries];
                next.splice(entryIdx + 1, 0, JSON.parse(JSON.stringify(entry)));
                onUpdateBlock(blockIndex, { entries: next });
              }}
              onDelete={() => removeEntry(entryIdx)}
            />
            <div className="flex justify-between items-baseline flex-wrap gap-1">
              <InlineEdit
                value={entry.name || ""}
                onChange={(v) => updateEntry(entryIdx, { name: v })}
                placeholder="Project Name"
                tag="span"
                className="font-bold text-gray-900"
              />
              <InlineEdit
                value={entry.url || ""}
                onChange={(v) => updateEntry(entryIdx, { url: v })}
                placeholder="URL"
                tag="span"
                className="text-xs text-gray-600"
              />
            </div>
            {(entry.technologies?.length > 0 || true) && (
              <div className="text-xs italic text-gray-700 mt-0.5 flex items-baseline gap-1">
                <span className="shrink-0">Technologies:</span>
                <KeywordChipsEditor
                  keywords={entry.technologies || []}
                  onChange={(techs) =>
                    updateEntry(entryIdx, { technologies: techs })
                  }
                />
              </div>
            )}
            <InlineEdit
              value={entry.description || ""}
              onChange={(v) => updateEntry(entryIdx, { description: v })}
              placeholder="Describe this project..."
              className="text-xs text-gray-800 mt-1 leading-relaxed"
              multiline
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addEntry}
        className="mt-3 text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] flex items-center gap-1 transition"
      >
        <Plus size={12} />
        <span>Add project</span>
      </button>
    </section>
  );
}

/* ─── Generic Entry Section (Awards, Volunteer, Publications) ─── */
function GenericEntrySection({
  block,
  blockIndex,
  onUpdateBlock,
  sectionTitle,
  fields,
  emptyEntry,
  addLabel = "Add entry",
  template,
  onAiAssist,
}) {
  const entries = block.entries || [];

  const updateEntry = (entryIdx, patch) => {
    const next = [...entries];
    next[entryIdx] = { ...next[entryIdx], ...patch };
    onUpdateBlock(blockIndex, { entries: next });
  };

  const addEntry = () => {
    onUpdateBlock(blockIndex, { entries: [...entries, { ...emptyEntry }] });
  };

  const removeEntry = (entryIdx) => {
    onUpdateBlock(blockIndex, {
      entries: entries.filter((_, i) => i !== entryIdx),
    });
  };

  return (
    <section className={template?.layoutVariant === "compact" ? "mb-3" : "mb-5"}>
      <SectionHeading
        title={sectionTitle}
        template={template}
        onAiAssist={onAiAssist}
      />
      <div className="space-y-2">
        {entries.map((entry, entryIdx) => (
          <div key={entryIdx} className="relative group/entry text-xs">
            <EntryToolbar
              onDuplicate={() => {
                const next = [...entries];
                next.splice(entryIdx + 1, 0, { ...entry });
                onUpdateBlock(blockIndex, { entries: next });
              }}
              onDelete={() => removeEntry(entryIdx)}
            />
            <div className="flex flex-wrap items-baseline gap-1">
              {fields.map((field) => (
                <React.Fragment key={field.key}>
                  {field.sep && (
                    <span className="text-gray-400">{field.sep}</span>
                  )}
                  <InlineEdit
                    value={entry[field.key] || ""}
                    onChange={(v) => updateEntry(entryIdx, { [field.key]: v })}
                    placeholder={field.placeholder}
                    tag="span"
                    className={field.className || "text-gray-800"}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addEntry}
        className="mt-2 text-[11px] text-[#8e8e8e] hover:text-[#1a1a1a] flex items-center gap-1 transition"
      >
        <Plus size={10} />
        <span>{addLabel}</span>
      </button>
    </section>
  );
}

/* ─── Languages Section ─── */
function LanguagesSection({ block, blockIndex, onUpdateBlock, template, onAiAssist }) {
  return (
    <GenericEntrySection
      block={block}
      blockIndex={blockIndex}
      onUpdateBlock={onUpdateBlock}
      sectionTitle="Languages"
      fields={[
        {
          key: "language",
          placeholder: "Language",
          className: "font-medium text-gray-900",
        },
        {
          key: "fluency",
          placeholder: "Fluency",
          sep: "—",
          className: "text-gray-600",
        },
      ]}
      emptyEntry={{ language: "", fluency: "" }}
      addLabel="Add language"
      template={template}
      onAiAssist={onAiAssist}
    />
  );
}

/* ═══════════════════════════════════════════ *
 * CanvasSection — Main export                 *
 * ═══════════════════════════════════════════ */
export default function CanvasSection({
  block,
  blockIndex,
  totalBlocks,
  basics,
  onBasicsChange,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onGenerateBullets,
  onAiAssistSection,
  aiLoading = false,
  aiLoadingSection = null,
  template,
  dragHandleProps,
}) {
  if (!block) return null;

  const isFirst = blockIndex === 0;
  const isLast = blockIndex === totalBlocks - 1;
  const onSectionAiAssist = onAiAssistSection ? () => onAiAssistSection(block, blockIndex) : undefined;

  const isSectionAiWorking = Boolean(aiLoading && aiLoadingSection?.blockIndex === blockIndex);
  const isSectionTypeWorking = Boolean(aiLoading && aiLoadingSection?.type === block.type);
  const isAiWorking = isSectionAiWorking || isSectionTypeWorking;
  const aiLoadingEntryIndex =
    aiLoadingSection?.type === "work-entry" && aiLoadingSection?.blockIndex === blockIndex
      ? aiLoadingSection.entryIndex
      : null;

  // Header block uses basics, not block data
  if (block.type === "header") {
    return (
      <div className="relative group/section">
        {/* Drag handle */}
        <div
          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/section:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...(dragHandleProps || {})}
        >
          <GripVertical
            size={16}
            className="text-zinc-300 hover:text-zinc-500"
          />
        </div>
        <HeaderSection basics={basics} onBasicsChange={onBasicsChange} template={template} />
      </div>
    );
  }

  const renderBlockContent = () => {
    switch (block.type) {
      case "summary":
        return (
          <SummarySection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            template={template}
            onAiAssist={onSectionAiAssist}
            isAiWorking={isAiWorking}
          />
        );
      case "work":
        return (
          <WorkSection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            onGenerateBullets={onGenerateBullets}
            template={template}
            onAiAssist={onSectionAiAssist}
            isAiWorking={isAiWorking}
            aiLoadingEntryIndex={aiLoadingEntryIndex}
          />
        );
      case "education":
        return (
          <EducationSection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      case "skills":
        return (
          <SkillsSection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            template={template}
            onAiAssist={onSectionAiAssist}
            isAiWorking={isAiWorking}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      case "languages":
        return (
          <LanguagesSection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      case "awards":
        return (
          <GenericEntrySection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            sectionTitle="Certifications & Awards"
            fields={[
              {
                key: "title",
                placeholder: "Title",
                className: "font-bold text-gray-900",
              },
              {
                key: "awarder",
                placeholder: "Issuer",
                sep: "–",
                className: "text-gray-800",
              },
              {
                key: "date",
                placeholder: "Date",
                sep: "(",
                className: "text-gray-600",
              },
            ]}
            emptyEntry={{ title: "", date: "", awarder: "", summary: "" }}
            addLabel="Add award"
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      case "volunteer":
        return (
          <GenericEntrySection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            sectionTitle="Volunteer Experience"
            fields={[
              {
                key: "position",
                placeholder: "Position",
                className: "font-bold text-gray-900",
              },
              {
                key: "organization",
                placeholder: "Organization",
                sep: "at",
                className: "italic text-gray-800",
              },
              { key: "startDate", placeholder: "Start", sep: "|" },
              { key: "endDate", placeholder: "End", sep: "–" },
            ]}
            emptyEntry={{
              organization: "",
              position: "",
              startDate: "",
              endDate: "",
              summary: "",
            }}
            addLabel="Add volunteer experience"
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      case "publications":
        return (
          <GenericEntrySection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            sectionTitle="Publications"
            fields={[
              {
                key: "name",
                placeholder: "Title",
                className: "font-bold text-gray-900",
              },
              {
                key: "publisher",
                placeholder: "Publisher",
                sep: "–",
                className: "text-gray-800",
              },
              {
                key: "releaseDate",
                placeholder: "Date",
                sep: "|",
                className: "text-gray-600",
              },
            ]}
            emptyEntry={{
              name: "",
              publisher: "",
              releaseDate: "",
              url: "",
              summary: "",
            }}
            addLabel="Add publication"
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      case "interests":
        return (
          <GenericEntrySection
            block={block}
            blockIndex={blockIndex}
            onUpdateBlock={onUpdateBlock}
            sectionTitle="Interests"
            fields={[
              {
                key: "name",
                placeholder: "Interest",
                className: "font-bold text-gray-900",
              },
            ]}
            emptyEntry={{ name: "", keywords: [] }}
            addLabel="Add interest"
            template={template}
            onAiAssist={onSectionAiAssist}
          />
        );
      default:
        return (
          <section className="mb-5">
            <SectionHeading title={block.title || block.type} template={template} onAiAssist={onSectionAiAssist} />
            <p className="text-xs text-gray-500 italic">
              Unknown section type: {block.type}
            </p>
          </section>
        );
    }
  };

  return (
    <div className="relative group/section">
      {/* Drag handle */}
      <div
        className="absolute -left-8 top-3 opacity-0 group-hover/section:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...(dragHandleProps || {})}
      >
        <GripVertical size={16} className="text-zinc-300 hover:text-zinc-500" />
      </div>

      {/* Section toolbar */}
      <SectionToolbar
        onMoveUp={() => onMoveBlock(blockIndex, blockIndex - 1)}
        onMoveDown={() => onMoveBlock(blockIndex, blockIndex + 1)}
        onDuplicate={() => onDuplicateBlock(blockIndex)}
        onDelete={() => onRemoveBlock(blockIndex)}
        onAiAssist={onSectionAiAssist}
        isAiLoading={isAiWorking}
        upDisabled={isFirst}
        downDisabled={isLast}
      />

      {/* Hover outline */}
      <div className="rounded-sm transition-all duration-150 group-hover/section:ring-1 group-hover/section:ring-black/[0.06] group-hover/section:bg-black/[0.005] px-1 -mx-1 py-0.5">
        {renderBlockContent()}
      </div>
    </div>
  );
}

