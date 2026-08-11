// Pistion API is a Servvice for code Execution
const PISTON_API = 'https://emkc.org/api/v2/piston/'
const LANGUAGE_VERSIONS = {
    "javascript": {
        "language": "javascript",
        "version": "15.10.0"
    },
    "python": {
        "language": "python",
        "version": "10.11.0"
    },
    "java": {
        "language": "java",
        "version": "16.13.0"
    },
    "C": {
        "language": "c",
        "version": "12.1.0"
    },
}

// jsdoc
// the function to execute code on the server

/**
 * @param {string} language -programming language
 * @param {string} code -source code to execute
 * @returns {Promise<{success:boolean,output?:string,error?: string}>} -result of code execution
 */



export async function executeCode(language, code) {
    try {
        const languageConfig = LANGUAGE_VERSIONS[language]

        if (!languageConfig) {
            return {
                success: false,
                error: `Unsupported language: ${language}`
            }
        }

        const response = await fetch(`${PISTON_API}/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: languageConfig.language,
                version: languageConfig.version,
                files: [
                    {
                        name: `main.${getFileExtension(language)}`,
                        content: code,
                    }
                ]
            })
        });
        if (!response.ok) {
            return {
                success: false,
                error: `HTTP error! status:${response.status}`
            }
        }

        const data = await response.json()


        const output = data.run.output || ""
        const stderr = data.run.stderr || ""
        if (stderr) {
            return {
                success: false,
                output: output,
                error: stderr,
            }
        }

        return {
            success: true,
            output: output || "No output"
        }

    }

    catch (error) {
        return {
            success: false,
            error: `Code execution failed :${error.message}`
        };
    }
}

// this is a helper to make file names ekv
const getFileExtension = (language) => {
    const extensions = {
        "javascript": "js",
        "python": "py",
        "java": "java",
        "c": "c",
    }
    return extensions[language] || ".txt";
}