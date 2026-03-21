export default function SectionCard({ title, children, extra }) {
    return (
      <section className="section-card">
        <div className="section-card-header">
          <h3>{title}</h3>
          {extra ? <div>{extra}</div> : null}
        </div>
        <div className="section-card-body">{children}</div>
      </section>
    )
  }