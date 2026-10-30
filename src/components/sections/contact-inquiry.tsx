'use client';

import WireboundInquiry, {
  type WireboundBrief,
  type WireboundQuestion,
} from '@/components/ui/wirebound-inquiry';
import { contactContent as content } from '@/content/contact';

const questions: WireboundQuestion[] = content.questions.map((question) => ({
  ...question,
  options: [...question.options],
}));

/** The brief as one readable WhatsApp message. */
function briefText(brief: WireboundBrief, reference: string) {
  const lines = [content.message.opening, `${content.message.reference}: ${reference}`, ''];
  for (const question of questions) {
    const picked = brief.answers[question.id] ?? [];
    lines.push(`${question.tab}: ${picked.length ? picked.join(', ') : '—'}`);
  }
  lines.push(
    '',
    `${content.message.name}: ${brief.name}`,
    `${content.message.email}: ${brief.email}`,
  );
  if (brief.message.trim()) lines.push(`${content.message.notes}: ${brief.message.trim()}`);
  return lines.join('\n');
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[22px] shrink-0 fill-current">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.25 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

/**
 * The contact page's notebook. Sending opens WhatsApp with the brief written
 * out, so it reaches Osama directly; a blocked new tab opens it in this one.
 */
export function ContactInquiry() {
  const send = (brief: WireboundBrief) => {
    const reference = 'OA-' + Date.now().toString(36).slice(-5).toUpperCase();
    const chatUrl = `https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(
      briefText(brief, reference),
    )}`;
    const chat = window.open(chatUrl, '_blank');
    if (chat) chat.opener = null;
    else window.location.href = chatUrl;
    return reference;
  };

  return (
    <WireboundInquiry
      kicker={content.kicker}
      headline={content.headline}
      intro={content.intro}
      email={content.email}
      availability={content.availability}
      direct={
        <div className="grid gap-[10px]">
          <p className="m-0 text-[13px] leading-snug font-semibold opacity-80">
            {content.chat.lead}
          </p>
          <a
            href={`https://wa.me/${content.whatsappNumber}?text=${encodeURIComponent(content.chat.text)}`}
            target="_blank"
            rel="noreferrer"
            className="group flex w-max max-w-full items-center gap-[12px] rounded-full bg-[#25D366] py-[10px] ps-[14px] pe-[20px] text-[#0b3d22] no-underline [box-shadow:0_6px_18px_#25d36640,inset_0_-2px_0_#0000001a] [transition:transform_180ms_ease,box-shadow_180ms_ease,background-color_180ms_ease] hover:[transform:translateY(-2px)] hover:bg-[#1ebe5b] hover:[box-shadow:0_10px_24px_#25d36659,inset_0_-2px_0_#0000001a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17284F] active:[transform:translateY(0)]"
          >
            <span className="grid size-[34px] place-items-center rounded-full bg-white text-[#25D366]">
              <WhatsAppGlyph />
            </span>
            <span className="grid leading-tight">
              <span className="text-[15px] font-bold">{content.chat.label}</span>
              <span className="text-[12px] font-medium opacity-80">{content.chat.note}</span>
            </span>
          </a>
        </div>
      }
      questions={questions}
      detailsTitle={content.details.title}
      detailsHint={content.details.hint}
      messagePlaceholder={content.details.messagePlaceholder}
      submitLabel={content.submitLabel}
      pendingLabel={content.pendingLabel}
      stampLabel={content.stampLabel}
      nextSteps={[...content.nextSteps]}
      copy={content.copy}
      receipt={content.receipt}
      onSubmit={send}
      palette={{ field: '#FFFFFF', muted: 'rgba(23, 40, 79, 0.72)' }}
      theme="light"
      height="100svh"
    />
  );
}
