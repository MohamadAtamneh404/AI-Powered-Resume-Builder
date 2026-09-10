import os, re

def replace_in_file(filepath, pattern, replacement):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(pattern, replacement, c)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

replace_in_file('BackEnd/index.js', r'\(err, req, res, next\)', r'(err, req, res, _next)')

replace_in_file('BackEnd/routes/auth.js', r'} catch \(err\) {', '} catch (_err) {')
replace_in_file('BackEnd/routes/jobApplications.js', r'} catch \(err\) {', '} catch (_err) {')
replace_in_file('BackEnd/routes/settings.js', r'} catch \(error\) {', '} catch (_error) {')

replace_in_file('BackEnd/routes/settings.js', r'const { oldPassword, newPassword, confirmPassword } = req\.body;', 'const { oldPassword, newPassword } = req.body;')

# Fix seedTemplates.js by changing import to require
replace_in_file('BackEnd/scripts/seedTemplates.js', r'import mongoose from [\'"]mongoose[\'"];', 'const mongoose = require("mongoose");')
replace_in_file('BackEnd/scripts/seedTemplates.js', r'import dotenv from [\'"]dotenv[\'"];', 'const dotenv = require("dotenv");')
replace_in_file('BackEnd/scripts/seedTemplates.js', r'import Template from [\'"]\.\./models/Template\.js[\'"];', 'const Template = require("../models/Template");')

# gemini.js
replace_in_file('BackEnd/models/gemini.js', r'const { additionalProperties, default: _default, examples, title, \.\.\.rest } = schema;', 'const { ...rest } = schema;')
replace_in_file('BackEnd/models/gemini.js', r'throw new Error\(`Gemini API Error: \$\{message\}`\);', 'throw new Error(`Gemini API Error: ${message}`, { cause: e });')
