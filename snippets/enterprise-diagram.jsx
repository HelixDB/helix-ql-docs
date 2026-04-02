export const EnterpriseDiagram = ({ diagram }) => {
  return (
    <div className="enterprise-diagram not-prose">
      <pre className="enterprise-diagram__pre">
        <code className="enterprise-diagram__code">{diagram}</code>
      </pre>
    </div>
  );
};
