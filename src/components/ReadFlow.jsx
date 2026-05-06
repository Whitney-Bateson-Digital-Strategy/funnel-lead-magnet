import { useState } from 'react';
import { ReadView } from './ReadView';

const QUESTIONS = [
  {
    key: 'leadMagnetTitle',
    label: "What's the title or topic of your lead magnet?",
    hint: "e.g., '5-Day Anti-Inflammatory Meal Plan' or 'The Gut Reset Checklist'",
    type: 'text',
  },
  {
    key: 'leadMagnetTeaches',
    label: 'What does your lead magnet actually teach or give people?',
    hint: 'Describe what someone walks away with after consuming it.',
    type: 'textarea',
  },
  {
    key: 'afterFeeling',
    label: 'After consuming it, what does someone believe or feel?',
    hint: 'What shifts in their mindset, awareness, or self-perception? This one matters more than people think.',
    type: 'textarea',
  },
  {
    key: 'paidOffer',
    label: "What's the paid offer this is meant to lead into?",
    hint: 'Name the program, package, or service.',
    type: 'text',
  },
  {
    key: 'offerType',
    label: 'What kind of offer is it?',
    type: 'select',
    options: [
      '1:1 coaching package',
      'Group program or cohort',
      'Self-paced course',
      'Membership or subscription',
      'Done-with-you service',
      'Hybrid (mix of the above)',
    ],
  },
  {
    key: 'transformation',
    label: 'What transformation does that paid offer actually deliver?',
    hint: 'Not the features. The actual change in their life or health.',
    type: 'textarea',
  },
  {
    key: 'currentlyAttracting',
    label: 'Who is your lead magnet currently attracting?',
    type: 'select',
    options: [
      'People just curious or browsing',
      'People doing early research',
      'People comparing options seriously',
      'People ready to invest in help',
      "Honestly, I'm not sure",
    ],
  },
  {
    key: 'priceRange',
    label: "What's the price point of your paid offer?",
    type: 'select',
    options: [
      'Under $200',
      '$200 to $500',
      '$500 to $1,500',
      '$1,500 to $3,000',
      '$3,000 to $7,500',
      '$7,500+',
    ],
  },
];

export function ReadFlow() {
  const [stage, setStage] = useState('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    leadMagnetTitle: '',
    leadMagnetTeaches: '',
    afterFeeling: '',
    paidOffer: '',
    offerType: '',
    transformation: '',
    currentlyAttracting: '',
    priceRange: '',
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const updateAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const canAdvance = () => {
    const current = QUESTIONS[questionIndex];
    return answers[current.key] && answers[current.key].trim().length > 0;
  };

  const generateRead = async () => {
    setStage('loading');
    setError(null);

    try {
      const response = await fetch('/api/generate-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setReport(data.output);
      setStage('report');
    } catch (err) {
      console.error('Read generation error:', err);
      setError(err.message || 'Something went wrong generating your Read. Please try again.');
      setStage('questions');
    }
  };

  // INTRO
  if (stage === 'intro') {
    return <IntroView onStart={() => setStage('optin')} />;
  }

  // OPT-IN
  if (stage === 'optin') {
    return (
      <OptInView
        name={name}
        email={email}
        onNameChange={setName}
        onEmailChange={setEmail}
        onContinue={() => setStage('questions')}
      />
    );
  }

  // QUESTIONS
  if (stage === 'questions') {
    return (
      <QuestionsView
        questions={QUESTIONS}
        questionIndex={questionIndex}
        answers={answers}
        onUpdate={updateAnswer}
        onNext={() => setQuestionIndex(questionIndex + 1)}
        onBack={() => setQuestionIndex(questionIndex - 1)}
        onSubmit={generateRead}
        canAdvance={canAdvance()}
        error={error}
      />
    );
  }

  // LOADING
  if (stage === 'loading') {
    return <LoadingView />;
  }

  // REPORT
  if (stage === 'report' && report) {
    return (
      <ReadView
        name={name}
        report={report}
        onStartOver={() => {
          setStage('intro');
          setQuestionIndex(0);
          setReport(null);
          setAnswers({
            leadMagnetTitle: '',
            leadMagnetTeaches: '',
            afterFeeling: '',
            paidOffer: '',
            offerType: '',
            transformation: '',
            currentlyAttracting: '',
            priceRange: '',
          });
        }}
      />
    );
  }

  return null;
}

// =========================
// INTRO VIEW
// =========================

function IntroView({ onStart }) {
  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-15%',
            width: '55%',
            height: '120%',
            background:
              'radial-gradient(ellipse at center, var(--sky-light) 0%, var(--sky-light) 35%, transparent 70%)',
            opacity: 0.55,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '40%',
            height: '70%',
            background:
              'radial-gradient(ellipse at center, var(--blush-light) 0%, transparent 65%)',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'clamp(4rem, 10vw, 8rem) 2rem clamp(4rem, 8vw, 7rem)',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '2rem',
              padding: '0.4rem 0.9rem 0.4rem 0.5rem',
              background: 'var(--cream-deep)',
              borderRadius: '100px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--coral)',
              }}
            />
            <span
              style={{
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--teal-dark)',
                fontWeight: 600,
              }}
            >
              Whitney's Read · Free
            </span>
          </div>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
              color: 'var(--teal-mid)',
              fontWeight: 500,
              margin: '0 0 1.5rem',
              maxWidth: '620px',
              lineHeight: 1.5,
            }}
          >
            Your opt-ins are climbing. Your sales aren't. There's a reason, and it isn't your offer.
          </p>

          <h1
            className="display"
            style={{
              fontSize: 'clamp(2.75rem, 8.5vw, 6.5rem)',
              color: 'var(--teal-dark)',
              margin: '0 0 2.5rem',
              maxWidth: '1000px',
            }}
          >
            What's your lead<br />
            magnet{' '}
            <span
              className="script"
              style={{ color: 'var(--coral)', fontSize: '1.05em', fontWeight: 500 }}
            >
              actually
            </span>
            <br />
            selling?
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 1.55vw, 1.25rem)',
              lineHeight: 1.6,
              color: 'var(--teal)',
              margin: '0 0 2.5rem',
              maxWidth: '620px',
            }}
          >
            For dietitians, nutritionists, and private practice clinicians who suspect their freebie is pulling in the wrong people. Answer 8 quick questions, and Whitney will share her read on where your funnel is leaking, sent straight to your inbox.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-coral"
              onClick={onStart}
              style={{ fontSize: '1.05rem', padding: '1.15rem 2.5rem' }}
            >
              Have Whitney take a look
            </button>
            <span
              style={{
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: '0.85rem',
                color: 'var(--teal-mid)',
                fontWeight: 500,
              }}
            >
              3 Minutes | 8 Questions | Based on Whitney's Framework
            </span>
          </div>
        </div>
      </section>

      {/* TRANSITION */}
      <section
        style={{
          maxWidth: '780px',
          margin: '5rem auto 0',
          padding: '0 2rem',
        }}
      >
        <p
          className="display"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            lineHeight: 1.2,
            color: 'var(--teal-dark)',
            margin: 0,
            maxWidth: '640px',
          }}
        >
          Most lead magnets attract the wrong{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--coral)' }}>kind</span> of person, not the wrong{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--coral)' }}>number</span> of people.
        </p>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: 'var(--teal-mid)',
            margin: '1.5rem 0 0',
            maxWidth: '640px',
          }}
        >
          You can have a great freebie that pulls in totally wrong-fit people. The list grows. The discovery calls don't. This read shows you exactly where the gap is.
        </p>
      </section>

      {/* CLOSING CTA */}
      <section
        style={{
          maxWidth: '780px',
          margin: '5rem auto 0',
          padding: '0 2rem 6rem',
          textAlign: 'center',
        }}
      >
        <p
          className="script"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            color: 'var(--coral)',
            margin: '0 0 1.5rem',
            lineHeight: 1.2,
          }}
        >
          ready to find out?
        </p>
        <button
          className="btn btn-coral"
          onClick={onStart}
          style={{ fontSize: '1.05rem', padding: '1.15rem 2.5rem' }}
        >
          Have Whitney take a look
        </button>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--teal-mid)',
            margin: '1.5rem 0 0',
          }}
        >
          3 Minutes | 8 Questions | Based on Whitney's Framework
        </p>
      </section>
    </div>
  );
}

// =========================
// OPT-IN VIEW
// =========================

function OptInView({ name, email, onNameChange, onEmailChange, onContinue }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>
        <div className="label" style={{ marginBottom: '2rem' }}>
          Step 1 of 2
        </div>

        <h2
          className="display"
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            color: 'var(--teal-dark)',
            marginBottom: '1.25rem',
            marginTop: 0,
            lineHeight: 1.05,
          }}
        >
          Where should we send your read?
        </h2>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--teal-mid)',
            lineHeight: 1.6,
            marginBottom: '3rem',
          }}
        >
          You'll see it right after the questions. We'll also email you a copy you can come back to.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <Input value={name} onChange={onNameChange} placeholder="Your first name" />
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <Input
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="Your email"
          />
        </div>

        <button
          className="btn btn-coral"
          onClick={onContinue}
          disabled={!name.trim() || !email.trim() || !email.includes('@')}
        >
          Continue to questions
        </button>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--teal-mid)',
            marginTop: '2rem',
            lineHeight: 1.5,
          }}
        >
          You'll be added to Whitney's email list. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

// =========================
// QUESTIONS VIEW
// =========================

function QuestionsView({
  questions,
  questionIndex,
  answers,
  onUpdate,
  onNext,
  onBack,
  onSubmit,
  canAdvance,
  error,
}) {
  const current = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
      }}
      key={questionIndex}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5rem',
          paddingTop: '2rem',
        }}
      >
        <div className="label">
          Question {questionIndex + 1} of {questions.length}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === questionIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: i === questionIndex ? '4px' : '50%',
                background:
                  i === questionIndex
                    ? 'var(--coral)'
                    : i < questionIndex
                    ? 'var(--teal)'
                    : 'var(--sky)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', flex: 1 }}>
        <h2
          className="display"
          style={{
            fontSize: 'clamp(1.65rem, 4vw, 2.5rem)',
            color: 'var(--teal-dark)',
            marginBottom: '1rem',
            marginTop: 0,
            lineHeight: 1.15,
          }}
        >
          {current.label}
        </h2>

        {current.hint && (
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--teal-mid)',
              marginBottom: '3rem',
              lineHeight: 1.55,
            }}
          >
            {current.hint}
          </p>
        )}

        <div style={{ marginBottom: '3rem' }}>
          {current.type === 'text' && (
            <Input
              value={answers[current.key]}
              onChange={(v) => onUpdate(current.key, v)}
              autoFocus
            />
          )}
          {current.type === 'textarea' && (
            <Textarea
              value={answers[current.key]}
              onChange={(v) => onUpdate(current.key, v)}
              autoFocus
            />
          )}
          {current.type === 'select' && (
            <Select
              value={answers[current.key]}
              onChange={(v) => onUpdate(current.key, v)}
              options={current.options}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {questionIndex > 0 && (
            <button className="btn-ghost" onClick={onBack}>
              Back
            </button>
          )}
          {isLast ? (
            <button className="btn btn-coral" onClick={onSubmit} disabled={!canAdvance}>
              Generate my read
            </button>
          ) : (
            <button className="btn btn-coral" onClick={onNext} disabled={!canAdvance}>
              Next
            </button>
          )}
        </div>

        {error && (
          <p style={{ marginTop: '1.5rem', color: 'var(--coral-deep)', fontSize: '0.95rem' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// =========================
// LOADING VIEW
// =========================

function LoadingView() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="script"
        style={{
          fontSize: '2rem',
          color: 'var(--coral)',
          marginBottom: '1.5rem',
        }}
      >
        reading between the lines
      </div>
      <p
        style={{
          color: 'var(--teal-mid)',
          fontSize: '1rem',
          maxWidth: '440px',
          lineHeight: 1.55,
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        Looking at the alignment between your lead magnet and your paid offer. About 15 to 30 seconds.
      </p>
      <PulseDots />
    </div>
  );
}

// =========================
// SHARED INPUTS
// =========================

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid var(--teal)',
  padding: '0.75rem 0',
  fontFamily: "'Nunito Sans', sans-serif",
  fontSize: '1.1rem',
  color: 'var(--teal)',
  outline: 'none',
  fontWeight: 400,
};

function Input({ value, onChange, placeholder, type = 'text', autoFocus = false }) {
  return (
    <input
      style={inputStyle}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  );
}

function Textarea({ value, onChange, autoFocus = false }) {
  return (
    <textarea
      style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.5 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      autoFocus={autoFocus}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      style={{
        ...inputStyle,
        appearance: 'none',
        cursor: 'pointer',
        paddingRight: '2rem',
        backgroundImage:
          "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath fill='none' stroke='%2302525d' stroke-width='2' d='M1 1l5 5 5-5'/%3e%3c/svg%3e\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.5rem center',
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select one</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function PulseDots() {
  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 4px;
          animation: pulse 1.4s ease-in-out infinite;
        }
        .pulse-dot:nth-child(1) { background: var(--coral); }
        .pulse-dot:nth-child(2) { background: var(--teal); animation-delay: 0.2s; }
        .pulse-dot:nth-child(3) { background: var(--blush); animation-delay: 0.4s; }
      `}</style>
      <span className="pulse-dot"></span>
      <span className="pulse-dot"></span>
      <span className="pulse-dot"></span>
    </div>
  );
}
