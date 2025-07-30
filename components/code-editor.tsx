"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, Copy, Check } from "lucide-react"

interface CodeEditorProps {
  initialCode?: string
  language?: string
  theme?: "light" | "dark"
  readOnly?: boolean
  onCodeChange?: (code: string) => void
  onRun?: (code: string) => void
}

export function CodeEditor({
  initialCode = "",
  language = "javascript",
  theme = "dark",
  readOnly = false,
  onCodeChange,
  onRun,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput("")

    try {
      // Simple JavaScript execution for demo purposes
      // In a real implementation, you'd want to use a sandboxed environment
      if (language === "javascript") {
        // Capture console.log output
        const logs: string[] = []
        const originalLog = console.log
        console.log = (...args) => {
          logs.push(args.map((arg) => String(arg)).join(" "))
        }

        try {
          // Create a function to execute the code
          const func = new Function(code)
          const result = func()

          if (result !== undefined) {
            logs.push(String(result))
          }
        } catch (error) {
          logs.push(`Error: ${error}`)
        } finally {
          console.log = originalLog
        }

        setOutput(logs.join("\n") || "Code executed successfully!")
      } else {
        setOutput("Code execution is only supported for JavaScript in this demo.")
      }

      onRun?.(code)
    } catch (error) {
      setOutput(`Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput("")
    onCodeChange?.(initialCode)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {theme} theme
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs bg-transparent">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs bg-transparent">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleRun}
            disabled={isRunning || readOnly}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            {isRunning ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
            ) : (
              <Play className="h-3 w-3 mr-1" />
            )}
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            readOnly={readOnly}
            className={`w-full h-full p-4 font-mono text-sm resize-none border-none outline-none ${
              theme === "dark" ? "bg-gray-900 text-green-400" : "bg-gray-50 text-gray-800"
            }`}
            placeholder="// Start coding here..."
            spellCheck={false}
            style={{
              minHeight: "300px",
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              lineHeight: "1.5",
              tabSize: 2,
            }}
          />
        </CardContent>
      </Card>

      {/* Output Panel */}
      {output && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-green-600">📤</span>
              Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              className={`text-sm p-3 rounded-md overflow-x-auto ${
                theme === "dark" ? "bg-gray-900 text-green-400" : "bg-gray-100 text-gray-800"
              }`}
            >
              {output}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Code Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Coding Tips:</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Use console.log() to output values</li>
                <li>• Try different approaches to solve the problem</li>
                <li>• Don't forget to test your code with different inputs</li>
                <li>• Use meaningful variable names</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
