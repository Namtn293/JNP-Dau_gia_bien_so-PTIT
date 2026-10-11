import React from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: "json" | "xml" | "graphql" | "sql";
  height?: string;
  readOnly?: boolean;
}

export const MonacoEditorField: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = "json",
  height = "300px",
  readOnly = false,
}) => {
  return (
    <div style={{ overflow: "hidden", paddingTop: "8px" }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          lineNumbers: "off",
          folding: false,
          padding: { top: 10, bottom: 10 },
        }}
      />
    </div>
  );
};
