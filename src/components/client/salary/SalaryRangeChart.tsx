import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import { ISalaryStats } from '@/config/api';
import s from 'styles/salary.module.scss';

import i18next from 'i18next';

const MILLION = 1_000_000;
// Fewer postings than this: show the row but flag it
const LIMITED = 3;

export const formatM = (value: number) => {
  const m = value / MILLION;
  return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
};

interface Props {
  rows: (ISalaryStats & { name: string; to?: string })[];
  // Shared axis so several charts on the page are comparable
  domain: [number, number];
}

const niceTicks = ([min, max]: [number, number]) => {
  const step = Math.max(5, Math.ceil((max - min) / MILLION / 4 / 5) * 5) * MILLION;
  const ticks: number[] = [];
  for (let t = Math.floor(min / step) * step; t <= max; t += step) ticks.push(t);
  return ticks;
};

/**
 * Salary ranges as rows: thin line = min..max, bar = P25..P75 (typical), dot = median
 */
const SalaryRangeChart = ({ rows, domain }: Props) => {
  const [lo, hi] = domain;
  const pct = (value: number) => `${((value - lo) / Math.max(hi - lo, 1)) * 100}%`;
  const width = (from: number, to: number) => `${((to - from) / Math.max(hi - lo, 1)) * 100}%`;

  if (!rows.length) return <div className={s['no-data']}>{i18next.t('app:components.client.salary.SalaryRangeChart.no_salary_data_for_this_filter')}</div>;

  return (
    <div className={s['range-chart']} role='table' aria-label='Salary ranges'>
      {rows.map(row => {
        const limited = row.count < LIMITED;
        const label = (
          <div className={s['range-label']} role='rowheader'>
            <span className={s['range-name']}>{row.name}</span>
            <span className={s['range-n']}>
              {row.count} job{row.count > 1 ? 's' : ''}
              {limited && <em> {i18next.t('app:components.client.salary.SalaryRangeChart.limited_data')}</em>}
            </span>
          </div>
        );
        return (
          <div
            key={row.key}
            className={`${s['range-row']} ${limited ? s['limited'] : ''}`}
            role='row'
          >
            {row.to ? (
              <Link to={row.to} className={s['range-link']}>
                {label}
              </Link>
            ) : (
              label
            )}
            <Tooltip
              title={
                <div className={s['tip']}>
                  <strong>{row.name}</strong>
                  <div>{i18next.t('app:components.client.salary.SalaryRangeChart.median')}{' '}{formatM(row.median)}</div>
                  <div>
                    {i18next.t('app:components.client.salary.SalaryRangeChart.typical_p25_p75')}{' '}{formatM(row.p25)} – {formatM(row.p75)}
                  </div>
                  <div>
                    {i18next.t('app:components.client.salary.SalaryRangeChart.full_range')}{' '}{formatM(row.min)} – {formatM(row.max)}
                  </div>
                  <div>
                    {i18next.t('app:components.client.salary.SalaryRangeChart.based_on')}{' '}{row.count} {i18next.t('app:components.client.salary.SalaryRangeChart.job_posting')}{row.count > 1 ? 's' : ''}
                  </div>
                </div>
              }
            >
              <div className={s['range-track']} role='cell'>
                <span
                  className={s['whisker']}
                  style={{ left: pct(row.min), width: width(row.min, row.max) }}
                />
                <span
                  className={s['box']}
                  style={{ left: pct(row.p25), width: width(row.p25, row.p75) }}
                />
                <span className={s['median']} style={{ left: pct(row.median) }} />
              </div>
            </Tooltip>
            <div className={s['range-value']} role='cell'>
              <strong>{formatM(row.median)}</strong>
              <span>
                {formatM(row.p25)}–{formatM(row.p75)}
              </span>
            </div>
          </div>
        );
      })}
      <div className={s['range-axis']} aria-hidden>
        <span />
        <div className={s['axis-track']}>
          {niceTicks(domain)
            .filter(t => t >= lo && t <= hi)
            .map(t => (
              <span key={t} style={{ left: pct(t) }}>
                {formatM(t)}
              </span>
            ))}
        </div>
        <span />
      </div>
    </div>
  );
};

export default SalaryRangeChart;
