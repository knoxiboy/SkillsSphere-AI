import axios from 'axios';

import logger from "./logger.js";

export const CODE_EXECUTION_ERROR_CODES = {
  UNSUPPORTED_LANGUAGE: "UNSUPPORTED_LANGUAGE",
  CODE_INPUT_TOO_LARGE: "CODE_INPUT_TOO_LARGE",
};

export const SUPPORTED_CODE_LANGUAGES = Object.freeze({
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
});

const DEFAULT_MAX_CODE_INPUT_BYTES = 64 * 1024;

export const getMaxCodeInputBytes = () => {
  const configuredLimit = Number(process.env.MAX_CODE_INPUT_BYTES);
  return Number.isSafeInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : DEFAULT_MAX_CODE_INPUT_BYTES;
};

const safeErrorResult = (errorCode, output) => ({
  output,
  isError: true,
  errorCode,
});

const normalizeLanguage = (language) => {
  if (typeof language !== "string") return null;
  const normalized = language.trim().toLowerCase();
  if (!/^[a-z0-9+#-]+$/.test(normalized)) return null;
  return normalized;
};

export const validateCodeExecutionRequest = (language, code) => {
  const normalizedLanguage = normalizeLanguage(language);
  if (!normalizedLanguage || !SUPPORTED_CODE_LANGUAGES[normalizedLanguage]) {
    return {
      isValid: false,
      result: safeErrorResult(
        CODE_EXECUTION_ERROR_CODES.UNSUPPORTED_LANGUAGE,
        "UNSUPPORTED_LANGUAGE: This code language is not supported.",
      ),
    };
  }

  const sourceCode = typeof code === "string" ? code : "";
  if (Buffer.byteLength(sourceCode, "utf8") > getMaxCodeInputBytes()) {
    return {
      isValid: false,
      result: safeErrorResult(
        CODE_EXECUTION_ERROR_CODES.CODE_INPUT_TOO_LARGE,
        "CODE_INPUT_TOO_LARGE: Code input is too large.",
      ),
    };
  }

  return {
    isValid: true,
    normalizedLanguage,
    sourceCode,
    targetLanguage: SUPPORTED_CODE_LANGUAGES[normalizedLanguage],
  };
};

/**
 * Executes code using the public Piston API.
 * @param {string} language - The programming language (e.g., 'javascript', 'python', 'cpp')
 * @param {string} code - The source code to execute
 * @returns {Promise<{output: string, isError: boolean}>}
 */
export const executeCode = async (language, code) => {
  const validation = validateCodeExecutionRequest(language, code);
  if (!validation.isValid) {
    return validation.result;
  }

  try {
    const targetLang = validation.targetLanguage;

    const response = await axios.post('https://emacs.piston.rs/api/v2/execute', {
      language: targetLang.language,
      version: targetLang.version,
      files: [
        {
          content: validation.sourceCode
        }
      ]
    });

    const data = response.data;
    
    // Piston API returns compile and run results
    if (data.compile && data.compile.code !== 0) {
      return { output: data.compile.output, isError: true };
    }

    if (data.run) {
      return { 
        output: data.run.output, 
        isError: data.run.code !== 0 
      };
    }

    return { output: "No output returned.", isError: false };

  } catch (error) {
    logger.error("Code execution failed:", error.message);
    
    // Fallback if Piston API is down or unreachable
    if (error.code === 'ENOTFOUND' || error.response?.status >= 500) {
      return {
        output: "Execution Service Unavailable: The remote code execution engine (Piston API) could not be reached.",
        isError: true
      };
    }
    
    return {
      output: error.response?.data?.message || error.message || "Failed to execute code.",
      isError: true
    };
  }
};
