import { workDisplay } from '@/config/work-fonts';
import { skillsContent } from '@/content/skills';
import { SkillsShowcase } from './skills-showcase';

/**
 * Skills, pinned beneath the end of Selected Work: the avatar draws the gallery
 * away to uncover it. It irises onto the footer's yellow.
 */
export function Skills() {
  return (
    <section
      id="skills"
      aria-label={skillsContent.label}
      className={`${workDisplay.variable} relative z-0 -mt-[270svh] bg-black motion-reduce:mt-0`}
    >
      <h2 className="sr-only">{skillsContent.title}</h2>
      <SkillsShowcase />
      <noscript>
        <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3 px-6 py-20 text-white">
          {skillsContent.skills.map((skill) => (
            <li key={skill.label} className="rounded-full border border-white/30 px-4 py-2">
              {skill.label}
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
