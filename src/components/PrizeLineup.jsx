import { Reveal } from './Reveal';
import { useI18n } from '../i18n/useI18n';

// Els tres premis com un programa: una fila per premi, tot a la mateixa mida
// (títol, qui el decideix, què inclou). Es fa servir a la portada (compacte) i
// a la pàgina de premis (amb la descripció de cada un).
const PRIZES = [
  {
    key: 'first',
    who: 'home.whoJury',
    title: 'prizes.firstTitle',
    text: 'prizes.firstText',
    items: ['prizes.firstItem1', 'prizes.firstItem2', 'prizes.firstItem3'],
  },
  {
    key: 'second',
    who: 'home.whoJury',
    title: 'prizes.secondTitle',
    text: 'prizes.secondText',
    items: ['prizes.secondItem1', 'prizes.secondItem2'],
  },
  {
    key: 'public',
    who: 'home.whoPublic',
    title: 'prizes.publicTitle',
    text: 'prizes.publicText',
    items: ['prizes.publicItem1', 'prizes.publicItem2', 'prizes.publicItem3'],
  },
];

export function PrizeLineup({ detailed = false }) {
  const { t } = useI18n();

  return (
    <ol className="grid gap-y-12 md:gap-y-16">
      {PRIZES.map((prize, i) => (
        <Reveal
          as="li"
          key={prize.key}
          index={i}
          className="grid gap-x-8 gap-y-3 text-lead font-medium leading-snug md:grid-cols-[1.15fr_0.75fr_2fr]"
        >
          <h3>{t(prize.title)}</h3>
          <p className="text-small md:text-lead">{t(prize.who)}</p>
          <div>
            {detailed && <p className="mb-4 max-w-xl text-body font-normal opacity-80">{t(prize.text)}</p>}
            <ul className="grid gap-1 text-body md:text-lead">
              {prize.items.map((item) => (
                <li key={item}>{t(item)}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
