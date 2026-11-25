import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, Input, Pagination, Select, Skeleton } from 'antd';
import { EnvironmentOutlined, SearchOutlined, StarFilled } from '@ant-design/icons';
import { ICompanyHighlight, callFetchCompany, callFetchCompanyHighlights } from '@/config/api';
import { SKILLS_LIST, convertSlug, getLocationName, nonAccentVietnamese } from '@/config/utils';
import { ICompany } from '@/types/backend';
import styles from 'styles/client.module.scss';
import s from 'styles/company-directory.module.scss';

import i18next from 'i18next';

const PAGE_SIZE = 12;
const CITIES = ['HA_NOI', 'HO_CHI_MINH', 'DA_NANG'];

type SortKey = 'jobs' | 'rating' | 'name';

interface ICompanyRow {
  company: ICompany;
  highlight?: ICompanyHighlight;
  cities: string[];
  summary: string;
}

const skillLabel = (value: string) =>
  SKILLS_LIST.find(item => item.value === value)?.label ?? value;

// Descriptions are stored as rich text, the directory only needs a plain excerpt
const toPlainText = (html = '') =>
  (
    new DOMParser().parseFromString(
      // Keep a space between block elements so headings and paragraphs don't run together
      html.replace(/<\/(p|div|h[1-6]|li)>|<br\s*\/?>/gi, '$& '),
      'text/html'
    ).body.textContent ?? ''
  )
    .replace(/\s+/g, ' ')
    .trim();

// Hiring locations come from open jobs, the address is the fallback for companies without one
const citiesOf = (company: ICompany, highlight?: ICompanyHighlight) => {
  if (highlight?.locations.length) return highlight.locations;
  const address = nonAccentVietnamese(company.address ?? '').toLowerCase();
  if (/ha ?noi/.test(address)) return ['HA_NOI'];
  if (/ho chi minh|hcm/.test(address)) return ['HO_CHI_MINH'];
  if (/da nang/.test(address)) return ['DA_NANG'];
  return [];
};

const CompanyListItem = ({ row }: { row: ICompanyRow }) => {
  const { company, highlight, cities, summary } = row;
  const openJobs = highlight?.openJobs ?? 0;

  return (
    <Link
      to={`/company/${convertSlug(company.name ?? '')}?id=${company._id}`}
      className={s['card']}
    >
      <div className={s['card-head']}>
        <div className={s['logo']}>
          {company.logo ? (
            <img src={company.logo} alt='' loading='lazy' />
          ) : (
            <span>{company.name?.charAt(0)}</span>
          )}
        </div>
        <div className={s['card-title']}>
          <h3 title={company.name}>{company.name}</h3>
          <p>
            <EnvironmentOutlined />
            {cities.length ? cities.map(getLocationName).join(', ') : i18next.t('app:pages.company.index.vietnam')}
          </p>
        </div>
      </div>

      {summary && <p className={s['summary']}>{summary}</p>}

      {!!highlight?.topSkills.length && (
        <ul className={s['skills']}>
          {highlight.topSkills
            .filter(skill => skill !== 'OTHER')
            .map(skill => (
              <li key={skill}>{skillLabel(skill)}</li>
            ))}
        </ul>
      )}

      <div className={s['card-foot']}>
        {highlight?.reviewCount ? (
          <span className={s['rating']}>
            <StarFilled /> {highlight.rating.toFixed(1)}
            <small>
              {highlight.reviewCount} review{highlight.reviewCount > 1 ? 's' : ''}
            </small>
          </span>
        ) : (
          <span className={s['muted']}>{i18next.t('app:pages.company.index.no_reviews_yet')}</span>
        )}
        {openJobs ? (
          <span className={s['jobs']}>
            {openJobs} {i18next.t('app:pages.company.index.open_job')}{openJobs > 1 ? 's' : ''}
          </span>
        ) : (
          <span className={s['muted']}>{i18next.t('app:pages.company.index.not_hiring')}</span>
        )}
      </div>
    </Link>
  );
};

const ClientCompanyPage = () => {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [highlights, setHighlights] = useState<ICompanyHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('ALL');
  const [sort, setSort] = useState<SortKey>('jobs');
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [companyRes, highlightRes] = await Promise.all([
        callFetchCompany('current=1&pageSize=200&sort=name'),
        callFetchCompanyHighlights(),
      ]);
      setCompanies(companyRes?.data?.result ?? []);
      setHighlights(highlightRes?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  const rows = useMemo<ICompanyRow[]>(() => {
    const byId = new Map(highlights.map(item => [item.companyId, item]));
    return companies.map(company => {
      const highlight = byId.get(company._id as string);
      return {
        company,
        highlight,
        cities: citiesOf(company, highlight),
        summary: toPlainText(company.description),
      };
    });
  }, [companies, highlights]);

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: rows.length, OTHER: 0 };
    rows.forEach(row => {
      const known = row.cities.filter(code => CITIES.includes(code));
      known.forEach(code => (counts[code] = (counts[code] ?? 0) + 1));
      if (!known.length) counts.OTHER += 1;
    });
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = nonAccentVietnamese(keyword.trim()).toLowerCase();
    const list = rows.filter(row => {
      if (
        term &&
        !nonAccentVietnamese(row.company.name ?? '')
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (city === 'ALL') return true;
      if (city === 'OTHER') return !row.cities.some(code => CITIES.includes(code));
      return row.cities.includes(city);
    });
    const byName = (a: ICompanyRow, b: ICompanyRow) =>
      (a.company.name ?? '').localeCompare(b.company.name ?? '');
    return list.sort((a, b) => {
      if (sort === 'jobs') {
        return (b.highlight?.openJobs ?? 0) - (a.highlight?.openJobs ?? 0) || byName(a, b);
      }
      if (sort === 'rating') {
        return (
          (b.highlight?.rating ?? 0) - (a.highlight?.rating ?? 0) ||
          (b.highlight?.reviewCount ?? 0) - (a.highlight?.reviewCount ?? 0) ||
          byName(a, b)
        );
      }
      return byName(a, b);
    });
  }, [rows, keyword, city, sort]);

  useEffect(() => setCurrent(1), [keyword, city, sort]);

  const totalJobs = highlights.reduce((sum, item) => sum + item.openJobs, 0);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const cityOptions = [
    { value: 'ALL', label: i18next.t('app:common.all_cities') },
    ...CITIES.filter(code => cityCounts[code]).map(code => ({
      value: code,
      label: getLocationName(code),
    })),
    ...(cityCounts.OTHER ? [{ value: 'OTHER', label: i18next.t('app:pages.company.index.other') }] : []),
  ];

  return (
    <div className={s['page']}>
      <header className={s['header']}>
        <div className={styles['container']}>
          <nav className={s['crumbs']} aria-label='Breadcrumb'>
            <Link to='/'>{i18next.t('app:common.home')}</Link>
            <span>/</span>
            <span aria-current='page'>{i18next.t('app:common.companies')}</span>
          </nav>
          <h1>{i18next.t('app:pages.company.index.top_it_companies_in_vietnam')}</h1>
          <p className={s['lead']}>
            {i18next.t('app:pages.company.index.compare_employers_by_open_roles_tech')}
          </p>
          {!isLoading && (
            <dl className={s['facts']}>
              <div>
                <dt>{i18next.t('app:common.companies')}</dt>
                <dd>{companies.length}</dd>
              </div>
              <div>
                <dt>{i18next.t('app:pages.company.index.open_jobs')}</dt>
                <dd>{totalJobs}</dd>
              </div>
              <div>
                <dt>{i18next.t('app:pages.company.index.hiring_now')}</dt>
                <dd>{highlights.filter(item => item.openJobs > 0).length}</dd>
              </div>
            </dl>
          )}
        </div>
      </header>

      <div className={styles['container']}>
        <div className={s['toolbar']}>
          <Input
            allowClear
            size='large'
            prefix={<SearchOutlined />}
            placeholder={i18next.t('app:pages.company.index.search_company_name')}
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            className={s['search']}
            aria-label='Search company name'
          />
          <div className={s['cities']} role='tablist' aria-label='City'>
            {cityOptions.map(option => (
              <button
                key={option.value}
                type='button'
                role='tab'
                aria-selected={city === option.value}
                className={city === option.value ? s['active'] : ''}
                onClick={() => setCity(option.value)}
              >
                {option.label}
                <span>{cityCounts[option.value] ?? 0}</span>
              </button>
            ))}
          </div>
          <Select<SortKey>
            size='large'
            value={sort}
            onChange={setSort}
            className={s['sort']}
            aria-label='Sort companies'
            options={[
              { value: 'jobs', label: i18next.t('app:pages.company.index.most_open_jobs') },
              { value: 'rating', label: i18next.t('app:pages.company.index.highest_rated') },
              { value: 'name', label: i18next.t('app:pages.company.index.name_a_z') },
            ]}
          />
        </div>

        <p className={s['count']}>
          {isLoading
            ? i18next.t('app:pages.company.index.loading_companies')
            : `${filtered.length} ${filtered.length === 1 ? 'company' : 'companies'}`}
        </p>

        {isLoading ? (
          <div className={s['grid']}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={s['card']}>
                <Skeleton avatar={{ shape: 'square', size: 56 }} active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <>
            <div className={s['grid']}>
              {pageItems.map(row => (
                <CompanyListItem key={row.company._id} row={row} />
              ))}
            </div>
            {filtered.length > PAGE_SIZE && (
              <div className={s['pager']}>
                <Pagination
                  current={current}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  showSizeChanger={false}
                  onChange={page => {
                    setCurrent(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <Empty className={s['empty']} description={i18next.t('app:pages.company.index.no_company_matches_your_search')} />
        )}
      </div>
    </div>
  );
};

export default ClientCompanyPage;
