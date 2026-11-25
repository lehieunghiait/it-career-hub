import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete, Button, Input, Select } from 'antd';
import {
  BankOutlined,
  EnvironmentOutlined,
  FileSearchOutlined,
  SearchOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { callFetchJobSuggestions, IJobSuggestions } from '@/config/api';
import { LOCATION_LIST, SKILLS_LIST, convertSlug } from '@/config/utils';
import CompanyLogo from '@/components/client/common/CompanyLogo';
import s from 'styles/job-board.module.scss';

import i18next from 'i18next';

const CITY_OPTIONS = [
  { get label() { return i18next.t('app:common.all_cities'); }, value: '' },
  ...LOCATION_LIST.filter(item => item.value !== 'ALL'),
];

const SUGGEST_DELAY = 250;
const EMPTY_SUGGESTIONS: IJobSuggestions = { jobs: [], companies: [] };

interface JobSearchBarProps {
  defaultKeyword?: string;
  defaultLocation?: string;
}

/**
 * Keyword + city search with suggestions (skills, job titles, companies);
 * submits to /job so filters live in the URL
 */
const JobSearchBar = ({ defaultKeyword = '', defaultLocation = '' }: JobSearchBarProps) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [location, setLocation] = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState<IJobSuggestions>(EMPTY_SUGGESTIONS);
  const requestId = useRef(0);

  // Debounced fetch; stale responses are dropped
  useEffect(() => {
    const q = keyword.trim();
    if (q.length < 2) {
      setSuggestions(EMPTY_SUGGESTIONS);
      return;
    }
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const res = await callFetchJobSuggestions(q);
      if (id === requestId.current) setSuggestions(res?.data ?? EMPTY_SUGGESTIONS);
    }, SUGGEST_DELAY);
    return () => clearTimeout(timer);
  }, [keyword]);

  const goSearch = (params: Record<string, string>) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && next.set(key, value));
    if (location) next.set('location', location);
    navigate(`/job${next.toString() ? `?${next}` : ''}`);
  };

  const submit = () => goSearch({ q: keyword.trim() });

  const options = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (q.length < 2) return [];

    const skills = SKILLS_LIST.filter(skill => skill.label.toLowerCase().includes(q)).slice(0, 4);
    const groups = [
      {
        title: i18next.t('app:common.skills'),
        items: skills.map(skill => ({
          value: `skill:${skill.value}`,
          label: (
            <div className={s['suggest-item']}>
              <TagOutlined />
              <span>{skill.label}</span>
            </div>
          ),
        })),
      },
      {
        title: i18next.t('app:components.client.job.JobSearchBar.job_titles'),
        items: suggestions.jobs.map(job => ({
          value: `job:${job.name}`,
          label: (
            <div className={s['suggest-item']}>
              <FileSearchOutlined />
              <span>{job.name}</span>
              {job.count > 1 && <small>{job.count} jobs</small>}
            </div>
          ),
        })),
      },
      {
        title: i18next.t('app:common.companies'),
        items: suggestions.companies.map(company => ({
          value: `company:${company._id}:${company.name}`,
          label: (
            <div className={s['suggest-item']}>
              {company.logo ? (
                <CompanyLogo className={s['suggest-logo']} src={company.logo} name={company.name} />
              ) : (
                <BankOutlined />
              )}
              <span>{company.name}</span>
              <small>
                {company.jobs} job{company.jobs > 1 ? 's' : ''}
              </small>
            </div>
          ),
        })),
      },
    ];

    return groups
      .filter(group => group.items.length)
      .map(group => ({
        label: <span className={s['suggest-title']}>{group.title}</span>,
        options: group.items,
      }));
  }, [keyword, suggestions]);

  const onSelect = (value: string) => {
    const [type, ...rest] = value.split(':');
    if (type === 'skill') {
      setKeyword('');
      goSearch({ skills: rest.join(':') });
    } else if (type === 'job') {
      const title = rest.join(':');
      setKeyword(title);
      goSearch({ q: title });
    } else if (type === 'company') {
      const [companyId, ...name] = rest;
      navigate(`/company/${convertSlug(name.join(':'))}?id=${companyId}`);
    }
  };

  return (
    <form
      className={s['search-bar']}
      onSubmit={e => {
        e.preventDefault();
        submit();
      }}
    >
      <Select
        className={s['search-city']}
        value={location}
        onChange={setLocation}
        options={CITY_OPTIONS}
        showSearch
        optionFilterProp='label'
        suffixIcon={<EnvironmentOutlined />}
        size='large'
        variant='borderless'
        popupMatchSelectWidth={220}
      />
      <span className={s['search-divider']} />
      <AutoComplete
        className={s['search-input']}
        value={keyword}
        onChange={value => setKeyword(value ?? '')}
        onSelect={onSelect}
        options={options}
        defaultActiveFirstOption={false}
        popupClassName={s['suggest-popup']}
      >
        <Input
          placeholder={i18next.t('app:components.client.job.JobSearchBar.job_title_skill_company')}
          prefix={<SearchOutlined />}
          size='large'
          variant='borderless'
          allowClear
          onPressEnter={e => {
            // Never let the form submit on Enter: a highlighted suggestion is handled by onSelect,
            // otherwise run a plain keyword search
            e.preventDefault();
            const highlighted = document.querySelector(
              `.${s['suggest-popup']}:not(.ant-select-dropdown-hidden) .ant-select-item-option-active`
            );
            if (!highlighted) submit();
          }}
        />
      </AutoComplete>
      <Button htmlType='submit' type='primary' size='large' className={s['search-btn']}>
        <SearchOutlined /> {i18next.t('app:components.client.job.JobSearchBar.search')}
      </Button>
    </form>
  );
};

export default JobSearchBar;
