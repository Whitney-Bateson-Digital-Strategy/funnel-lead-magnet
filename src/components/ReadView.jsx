/**
 * ReadView — renders a generated Read as a letter from Whitney.
 *
 * Used in two places:
 * 1. Inline in ReadFlow after a user submits
 * 2. On /r/[id] when a user clicks the link from their email
 *
 * Both usages should look identical.
 */

export function ReadView({ name, report, onStartOver = null }) {
  return (
    <div
      style={{
        maxWidth: '740px',
        margin: '0 auto',
        padding: '3rem 2rem 6rem',
      }}
    >
      {/* Letter top */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '3rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(2, 82, 93, 0.15)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div className="label">Whitney's Read for {name}</div>
        <div className="label" style={{ color: 'var(--teal-mid)' }}>
          From Whitney Bateson
        </div>
      </div>

      {/* Title */}
      <h2
        className="display"
        style={{
          fontSize: 'clamp(1.85rem, 4.5vw, 3.25rem)',
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '3rem',
          lineHeight: 1.1,
        }}
      >
        A few thoughts on{' '}
        <span className="script" style={{ color: 'var(--coral)', fontWeight: 500 }}>
          your funnel
        </span>
        .
      </h2>

      {/* Opener */}
      <p
        style={{
          fontSize: '1.15rem',
          lineHeight: 1.7,
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '2.5rem',
        }}
      >
        {report.opener}
      </p>

      {/* Spectrum intro */}
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '1.5rem',
        }}
      >
        {report.spectrumIntro}
      </p>

      {/* Spectrum visual */}
      <SpectrumVisual
        leadMagnetPosition={report.leadMagnetPosition}
        offerPosition={report.offerPosition}
      />

      {/* Spectrum thought */}
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '3.5rem',
        }}
      >
        {report.spectrumThought}
      </p>

      {/* Three thoughts */}
      <Thought header={report.thoughtOneHeader} body={report.thoughtOne} />
      <Thought header={report.thoughtTwoHeader} body={report.thoughtTwo} />
      <Thought header={report.thoughtThreeHeader} body={report.thoughtThree} marginBottom="3.5rem" />

      {/* Actions intro */}
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '1.75rem',
        }}
      >
        {report.actionsIntro}
      </p>

      {/* Actions */}
      <div
        style={{
          marginBottom: '3rem',
          paddingLeft: '1.5rem',
          borderLeft: '3px solid var(--lime)',
        }}
      >
        {report.actions &&
          report.actions.map((action, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '1rem',
                marginBottom: i < report.actions.length - 1 ? '1.5rem' : '0',
                alignItems: 'start',
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontSize: '1.5rem',
                  color: 'var(--coral)',
                  lineHeight: 1,
                  fontWeight: 500,
                  paddingTop: '0.15rem',
                }}
              >
                {i + 1}
              </span>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.65,
                  color: 'var(--teal-dark)',
                  margin: 0,
                }}
              >
                {action}
              </p>
            </div>
          ))}
      </div>

      {/* Closer */}
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '2rem',
        }}
      >
        {report.closer}
      </p>

      {/* Signature */}
      <p
        className="script"
        style={{
          fontSize: '2.25rem',
          color: 'var(--coral)',
          margin: 0,
          lineHeight: 1,
        }}
      >
        Whitney
      </p>

      {/* Utility actions */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(2, 82, 93, 0.15)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button className="btn-ghost" onClick={() => window.print()}>
          Save as PDF
        </button>
        {onStartOver && (
          <button className="btn-ghost" onClick={onStartOver}>
            Start over
          </button>
        )}
      </div>
    </div>
  );
}

function Thought({ header, body, marginBottom = '3rem' }) {
  return (
    <section style={{ marginBottom }}>
      <h3
        className="display"
        style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
          color: 'var(--teal-dark)',
          marginTop: 0,
          marginBottom: '1rem',
          lineHeight: 1.2,
          fontWeight: 500,
        }}
      >
        {header}
      </h3>
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.7,
          color: 'var(--teal-dark)',
          margin: 0,
        }}
      >
        {body}
      </p>
    </section>
  );
}

function SpectrumVisual({ leadMagnetPosition, offerPosition }) {
  const lmPos = Math.max(2, Math.min(98, parseFloat(leadMagnetPosition) || 25));
  const oPos = Math.max(2, Math.min(98, parseFloat(offerPosition) || 70));

  return (
    <div
      style={{
        position: 'relative',
        marginTop: '2.5rem',
        marginBottom: '3rem',
        paddingTop: '3rem',
        paddingBottom: '2rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '10px',
          borderRadius: '100px',
          background: 'linear-gradient(to right, var(--sky) 0%, var(--lime) 50%, var(--coral) 100%)',
          boxShadow: 'inset 0 1px 2px rgba(2, 82, 93, 0.1)',
        }}
      >
        {/* Lead magnet marker */}
        <Marker
          position={lmPos}
          color="var(--teal-dark)"
          labelTop={
            <>
              <div className="label" style={{ fontSize: '0.6rem', marginBottom: '0.2rem', opacity: 0.7 }}>
                Your freebie
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontSize: '0.95rem',
                  color: 'var(--teal-dark)',
                  fontWeight: 500,
                }}
              >
                drops people here
              </div>
            </>
          }
        />
        {/* Offer marker */}
        <Marker
          position={oPos}
          color="var(--coral)"
          labelBottom={
            <>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  fontSize: '0.95rem',
                  color: 'var(--teal-dark)',
                  fontWeight: 500,
                  marginBottom: '0.2rem',
                }}
              >
                your offer needs them
              </div>
              <div className="label" style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                Around here
              </div>
            </>
          }
        />
      </div>

      {/* Endpoint labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1.5rem',
          paddingTop: '0.5rem',
        }}
      >
        <span className="label" style={{ fontSize: '0.65rem', opacity: 0.6 }}>
          Cold
        </span>
        <span className="label" style={{ fontSize: '0.65rem', opacity: 0.6 }}>
          Warm
        </span>
        <span className="label" style={{ fontSize: '0.65rem', opacity: 0.6 }}>
          Hot
        </span>
      </div>
    </div>
  );
}

function Marker({ position, color, labelTop = null, labelBottom = null }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: `${position}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: color,
          border: '3px solid var(--cream)',
          boxShadow: '0 2px 6px rgba(2, 82, 93, 0.25)',
        }}
      />
      {labelTop && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {labelTop}
        </div>
      )}
      {labelBottom && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {labelBottom}
        </div>
      )}
    </div>
  );
}
