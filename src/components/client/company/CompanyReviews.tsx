import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Radio,
  Rate,
  Segmented,
  Skeleton,
  Tag,
  message,
} from 'antd';
import {
  EditOutlined,
  LikeOutlined,
  LockOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useUser } from '@clerk/react';
import dayjs from 'dayjs';
import {
  ICompanyInterview,
  ICompanyReview,
  IReviewSummary,
  callCreateCompanyInterview,
  callCreateCompanyReview,
  callFetchCompanyInterviews,
  callFetchCompanyReviews,
  callFetchReviewSummary,
} from '@/config/api';
import s from 'styles/company-reviews.module.scss';

import i18next from 'i18next';

const PAGE_SIZE = 5;

const CATEGORIES: { key: keyof NonNullable<ICompanyReview['ratings']>; label: string }[] = [
  { key: 'salary', get label() { return i18next.t('app:components.client.company.CompanyReviews.salary_benefits'); } },
  { key: 'culture', get label() { return i18next.t('app:components.client.company.CompanyReviews.culture_fun'); } },
  { key: 'management', get label() { return i18next.t('app:components.client.company.CompanyReviews.management'); } },
  { key: 'workLifeBalance', get label() { return i18next.t('app:components.client.company.CompanyReviews.work_life_balance'); } },
  { key: 'growth', get label() { return i18next.t('app:components.client.company.CompanyReviews.career_growth'); } },
];

const OUTCOME = {
  offer: { get label() { return i18next.t('app:components.client.company.CompanyReviews.got_an_offer'); }, color: 'green' },
  no_offer: { get label() { return i18next.t('app:components.client.company.CompanyReviews.no_offer'); }, color: 'red' },
  pending: { get label() { return i18next.t('app:components.client.company.CompanyReviews.waiting_for_result'); }, color: 'gold' },
};
const EXPERIENCE = {
  positive: { get label() { return i18next.t('app:components.client.company.CompanyReviews.positive_experience'); }, color: 'green' },
  neutral: { get label() { return i18next.t('app:components.client.company.CompanyReviews.neutral_experience'); }, color: 'default' },
  negative: { get label() { return i18next.t('app:components.client.company.CompanyReviews.negative_experience'); }, color: 'red' },
};
const DIFFICULTY = ['Very easy', 'Easy', 'Average', 'Hard', 'Very hard'];

// Month only: exact dates make anonymous posts easier to trace back
const postedOn = (date: string) => dayjs(date).format('MM/YYYY');

const Paragraphs = ({ text }: { text?: string }) => (
  <>
    {(text ?? '')
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => (
        <p key={index}>{line}</p>
      ))}
  </>
);

interface Props {
  companyId: string;
  companyName: string;
  onSummary?: (summary: IReviewSummary) => void;
}

/**
 * Anonymous employee reviews and interview experiences of a company
 */
const CompanyReviews = ({ companyId, companyName, onSummary }: Props) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [summary, setSummary] = useState<IReviewSummary | null>(null);
  const [tab, setTab] = useState<'reviews' | 'interviews'>('reviews');
  const [reviews, setReviews] = useState<ICompanyReview[]>([]);
  const [interviews, setInterviews] = useState<ICompanyInterview[]>([]);
  const [page, setPage] = useState({ reviews: 1, interviews: 1 });
  const [total, setTotal] = useState({ reviews: 0, interviews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openForm, setOpenForm] = useState<'review' | 'interview' | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [summaryRes, reviewRes, interviewRes] = await Promise.all([
      callFetchReviewSummary(companyId),
      callFetchCompanyReviews(companyId, 1, PAGE_SIZE),
      callFetchCompanyInterviews(companyId, 1, PAGE_SIZE),
    ]);
    if (summaryRes?.data) {
      setSummary(summaryRes.data);
      onSummary?.(summaryRes.data);
    }
    setReviews(reviewRes?.data?.result ?? []);
    setInterviews(interviewRes?.data?.result ?? []);
    setTotal({
      reviews: reviewRes?.data?.meta.total ?? 0,
      interviews: interviewRes?.data?.meta.total ?? 0,
    });
    setPage({ reviews: 1, interviews: 1 });
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [companyId]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const next = page[tab] + 1;
    if (tab === 'reviews') {
      const res = await callFetchCompanyReviews(companyId, next, PAGE_SIZE);
      setReviews(list => [...list, ...(res?.data?.result ?? [])]);
    } else {
      const res = await callFetchCompanyInterviews(companyId, next, PAGE_SIZE);
      setInterviews(list => [...list, ...(res?.data?.result ?? [])]);
    }
    setPage(current => ({ ...current, [tab]: next }));
    setIsLoadingMore(false);
  };

  const startForm = (type: 'review' | 'interview') => {
    if (!isSignedIn) {
      navigate(
        `/login?callback=${encodeURIComponent(window.location.pathname + window.location.search)}`
      );
      return;
    }
    setOpenForm(type);
  };

  const r = summary?.reviews;
  const maxStars = Math.max(1, ...(r?.distribution ?? [0]));
  const list = tab === 'reviews' ? reviews : interviews;
  const hasMore = list.length < total[tab];

  return (
    <section className={s['section']} id='company-reviews'>
      <div className={s['head']}>
        <div>
          <h2>{i18next.t('app:components.client.company.CompanyReviews.reviews_interviews')}</h2>
          <p>
            <LockOutlined /> {i18next.t('app:components.client.company.CompanyReviews.posted_anonymously_by_employees_and_candidates')}{' '}{companyName}.
          </p>
        </div>
        <div className={s['head-actions']}>
          <Button type='primary' icon={<EditOutlined />} onClick={() => startForm('review')}>
            {i18next.t('app:components.client.company.CompanyReviews.write_a_review')}
          </Button>
          <Button icon={<MessageOutlined />} onClick={() => startForm('interview')}>
            {i18next.t('app:components.client.company.CompanyReviews.share_an_interview')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          {r && r.count > 0 && (
            <div className={s['summary']}>
              <div className={s['score']}>
                <strong>{r.rating.toFixed(1)}</strong>
                <Rate disabled allowHalf value={Math.round(r.rating * 2) / 2} />
                <span>
                  {r.count} review{r.count > 1 ? 's' : ''}
                </span>
                <span className={s['recommend']}>
                  <LikeOutlined /> {r.recommendPercent}{i18next.t('app:components.client.company.CompanyReviews.would_recommend')}
                </span>
              </div>
              <div className={s['bars']} aria-label='Rating distribution'>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = r.distribution[star - 1] ?? 0;
                  return (
                    <div key={star} className={s['bar-row']}>
                      <span>{star}★</span>
                      <div className={s['bar']}>
                        <i style={{ width: `${(count / maxStars) * 100}%` }} />
                      </div>
                      <span className={s['bar-n']}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className={s['categories']}>
                {CATEGORIES.filter(c => r.categories[c.key]).map(category => (
                  <div key={category.key} className={s['category']}>
                    <span>{category.label}</span>
                    <div className={s['bar']}>
                      <i style={{ width: `${(r.categories[category.key] / 5) * 100}%` }} />
                    </div>
                    <strong>{r.categories[category.key].toFixed(1)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Segmented
            className={s['tabs']}
            value={tab}
            onChange={value => setTab(value as 'reviews' | 'interviews')}
            options={[
              { label: i18next.t('app:components.client.company.CompanyReviews.reviews', { v0: total.reviews }), value: 'reviews' },
              { label: i18next.t('app:components.client.company.CompanyReviews.interviews', { v0: total.interviews }), value: 'interviews' },
            ]}
          />

          {tab === 'interviews' && summary && summary.interviews.count > 0 && (
            <div className={s['interview-stats']}>
              <span>
                {i18next.t('app:components.client.company.CompanyReviews.difficulty')}{' '}<strong>{summary.interviews.difficulty.toFixed(1)}/5</strong>
              </span>
              <span>
                {i18next.t('app:components.client.company.CompanyReviews.positive_experience')}{' '}<strong>{summary.interviews.positivePercent}%</strong>
              </span>
              <span>
                {i18next.t('app:components.client.company.CompanyReviews.got_an_offer')}{' '}<strong>{summary.interviews.offerPercent}%</strong>
              </span>
            </div>
          )}

          {list.length === 0 ? (
            <Empty
              className={s['empty']}
              description={
                tab === 'reviews'
                  ? i18next.t('app:components.client.company.CompanyReviews.no_review_yet_worked_here_help')
                  : i18next.t('app:components.client.company.CompanyReviews.no_interview_experience_yet_interviewed_here')
              }
            />
          ) : (
            <div className={s['list']}>
              {tab === 'reviews'
                ? reviews.map(review => (
                    <article key={review._id} className={s['item']}>
                      <div className={s['item-head']}>
                        <Rate disabled value={review.rating} className={s['item-rate']} />
                        {review.recommend !== undefined && (
                          <Tag color={review.recommend ? 'green' : 'default'}>
                            {review.recommend ? i18next.t('app:components.client.company.CompanyReviews.recommends') : i18next.t('app:components.client.company.CompanyReviews.doesn_t_recommend')}
                          </Tag>
                        )}
                      </div>
                      <h3>{review.title}</h3>
                      <div className={s['author']}>
                        <UserOutlined /> {i18next.t('app:components.client.company.CompanyReviews.anonymous')}{' '}
                        {review.employmentStatus === 'former'
                          ? i18next.t('app:components.client.company.CompanyReviews.former_employee')
                          : i18next.t('app:components.client.company.CompanyReviews.current_employee')}
                        {review.jobTitle ? ` · ${review.jobTitle}` : ''} ·{' '}
                        {postedOn(review.createdAt)}
                      </div>
                      <div className={s['block']}>
                        <span className={s['pros']}>{i18next.t('app:components.client.company.CompanyReviews.pros')}</span>
                        <Paragraphs text={review.pros} />
                      </div>
                      <div className={s['block']}>
                        <span className={s['cons']}>{i18next.t('app:components.client.company.CompanyReviews.cons')}</span>
                        <Paragraphs text={review.cons} />
                      </div>
                      {review.advice && (
                        <div className={s['block']}>
                          <span className={s['advice']}>{i18next.t('app:components.client.company.CompanyReviews.advice_to_management')}</span>
                          <Paragraphs text={review.advice} />
                        </div>
                      )}
                    </article>
                  ))
                : interviews.map(interview => (
                    <article key={interview._id} className={s['item']}>
                      <h3>{interview.jobTitle}</h3>
                      <div className={s['author']}>
                        <UserOutlined /> {i18next.t('app:components.client.company.CompanyReviews.anonymous_candidate')}{' '}{postedOn(interview.createdAt)}
                      </div>
                      <div className={s['tags']}>
                        <Tag color={OUTCOME[interview.outcome]?.color}>
                          {OUTCOME[interview.outcome]?.label}
                        </Tag>
                        <Tag color={EXPERIENCE[interview.experience]?.color}>
                          {EXPERIENCE[interview.experience]?.label}
                        </Tag>
                        <Tag>
                          {DIFFICULTY[interview.difficulty - 1]} ({interview.difficulty}/5)
                        </Tag>
                      </div>
                      <div className={s['block']}>
                        <span className={s['advice']}>{i18next.t('app:components.client.company.CompanyReviews.process')}</span>
                        <Paragraphs text={interview.process} />
                      </div>
                      {interview.questions && (
                        <div className={s['block']}>
                          <span className={s['advice']}>{i18next.t('app:components.client.company.CompanyReviews.questions_asked')}</span>
                          <Paragraphs text={interview.questions} />
                        </div>
                      )}
                    </article>
                  ))}
            </div>
          )}

          {hasMore && (
            <div className={s['more']}>
              <Button loading={isLoadingMore} onClick={loadMore}>
                {i18next.t('app:components.client.company.CompanyReviews.show_more')}
              </Button>
            </div>
          )}
        </>
      )}

      <ReviewFormModal
        open={openForm === 'review'}
        companyId={companyId}
        companyName={companyName}
        onClose={() => setOpenForm(null)}
        onDone={() => {
          setOpenForm(null);
          setTab('reviews');
          load();
        }}
      />
      <InterviewFormModal
        open={openForm === 'interview'}
        companyId={companyId}
        companyName={companyName}
        onClose={() => setOpenForm(null)}
        onDone={() => {
          setOpenForm(null);
          setTab('interviews');
          load();
        }}
      />
    </section>
  );
};

interface FormModalProps {
  open: boolean;
  companyId: string;
  companyName: string;
  onClose: () => void;
  onDone: () => void;
}

const AnonymousNote = () => (
  <div className={s['anon-note']}>
    <LockOutlined /> {i18next.t('app:components.client.company.CompanyReviews.your_name_email_and_account_are')}
  </div>
);

const ReviewFormModal = ({ open, companyId, companyName, onClose, onDone }: FormModalProps) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const values = await form.validateFields();
    setIsSubmitting(true);
    const ratings = Object.fromEntries(
      CATEGORIES.map(c => [c.key, values[c.key]]).filter(([, value]) => value)
    );
    const res = await callCreateCompanyReview({
      companyId,
      rating: values.rating,
      ratings,
      title: values.title.trim(),
      pros: values.pros.trim(),
      cons: values.cons.trim(),
      advice: values.advice?.trim() || undefined,
      recommend: values.recommend,
      jobTitle: values.jobTitle?.trim() || undefined,
      employmentStatus: values.employmentStatus,
    });
    setIsSubmitting(false);
    if (res?.data) {
      message.success(i18next.t('app:components.client.company.CompanyReviews.thanks_your_review_is_now_live'));
      form.resetFields();
      onDone();
    } else {
      message.error(
        Array.isArray(res?.message) ? res.message[0] : (res?.message ?? i18next.t('app:components.client.company.CompanyReviews.cannot_post_the_review'))
      );
    }
  };

  return (
    <Modal
      open={open}
      title={i18next.t('app:components.client.company.CompanyReviews.review', { v0: companyName })}
      onCancel={onClose}
      onOk={submit}
      okText={i18next.t('app:components.client.company.CompanyReviews.post_anonymously')}
      okButtonProps={{ loading: isSubmitting }}
      width={640}
      destroyOnClose
      centered
    >
      <AnonymousNote />
      <Form
        form={form}
        layout='vertical'
        requiredMark={false}
        initialValues={{ employmentStatus: 'current' }}
      >
        <Form.Item
          name='rating'
          label={i18next.t('app:components.client.company.CompanyReviews.overall_rating')}
          rules={[{ required: true, message: i18next.t('app:components.client.company.CompanyReviews.please_rate_the_company') }]}
        >
          <Rate />
        </Form.Item>
        <div className={s['form-grid']}>
          {CATEGORIES.map(category => (
            <Form.Item key={category.key} name={category.key} label={category.label}>
              <Rate className={s['small-rate']} />
            </Form.Item>
          ))}
        </div>
        <div className={s['form-grid']}>
          <Form.Item name='employmentStatus' label={i18next.t('app:components.client.company.CompanyReviews.you_are_a')}>
            <Radio.Group
              options={[
                { label: i18next.t('app:components.client.company.CompanyReviews.current_employee'), value: 'current' },
                { label: i18next.t('app:components.client.company.CompanyReviews.former_employee'), value: 'former' },
              ]}
            />
          </Form.Item>
          <Form.Item name='jobTitle' label={i18next.t('app:components.client.company.CompanyReviews.your_position_optional')}>
            <Input placeholder={i18next.t('app:components.client.company.CompanyReviews.backend_developer')} maxLength={100} />
          </Form.Item>
        </div>
        <Form.Item
          name='title'
          label={i18next.t('app:components.client.company.CompanyReviews.review_title')}
          rules={[{ required: true, min: 5, message: i18next.t('app:components.client.company.CompanyReviews.at_least_5_characters') }]}
        >
          <Input placeholder={i18next.t('app:components.client.company.CompanyReviews.great_team_slow_promotions')} maxLength={120} />
        </Form.Item>
        <Form.Item
          name='pros'
          label={i18next.t('app:components.client.company.CompanyReviews.pros')}
          rules={[{ required: true, min: 20, message: i18next.t('app:components.client.company.CompanyReviews.at_least_20_characters') }]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={2000} showCount />
        </Form.Item>
        <Form.Item
          name='cons'
          label={i18next.t('app:components.client.company.CompanyReviews.cons')}
          rules={[{ required: true, min: 20, message: i18next.t('app:components.client.company.CompanyReviews.at_least_20_characters') }]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={2000} showCount />
        </Form.Item>
        <Form.Item name='advice' label={i18next.t('app:components.client.company.CompanyReviews.advice_to_management_optional')}>
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} />
        </Form.Item>
        <Form.Item name='recommend' label={i18next.t('app:components.client.company.CompanyReviews.would_you_recommend_this_company_to')}>
          <Radio.Group
            options={[
              { label: i18next.t('app:components.client.company.CompanyReviews.yes'), value: true },
              { label: i18next.t('app:components.client.company.CompanyReviews.no'), value: false },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const InterviewFormModal = ({ open, companyId, companyName, onClose, onDone }: FormModalProps) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const values = await form.validateFields();
    setIsSubmitting(true);
    const res = await callCreateCompanyInterview({
      companyId,
      jobTitle: values.jobTitle.trim(),
      difficulty: values.difficulty,
      experience: values.experience,
      outcome: values.outcome,
      process: values.process.trim(),
      questions: values.questions?.trim() || undefined,
    });
    setIsSubmitting(false);
    if (res?.data) {
      message.success(i18next.t('app:components.client.company.CompanyReviews.thanks_for_sharing_your_interview'));
      form.resetFields();
      onDone();
    } else {
      message.error(Array.isArray(res?.message) ? res.message[0] : (res?.message ?? i18next.t('app:components.client.company.CompanyReviews.cannot_post')));
    }
  };

  return (
    <Modal
      open={open}
      title={i18next.t('app:components.client.company.CompanyReviews.interview_at', { v0: companyName })}
      onCancel={onClose}
      onOk={submit}
      okText={i18next.t('app:components.client.company.CompanyReviews.post_anonymously')}
      okButtonProps={{ loading: isSubmitting }}
      width={640}
      destroyOnClose
      centered
    >
      <AnonymousNote />
      <Form form={form} layout='vertical' requiredMark={false}>
        <Form.Item
          name='jobTitle'
          label={i18next.t('app:components.client.company.CompanyReviews.position_you_interviewed_for')}
          rules={[{ required: true, message: i18next.t('app:components.client.company.CompanyReviews.please_enter_the_position') }]}
        >
          <Input placeholder={i18next.t('app:components.client.company.CompanyReviews.senior_java_developer')} maxLength={100} />
        </Form.Item>
        <div className={s['form-grid']}>
          <Form.Item
            name='outcome'
            label={i18next.t('app:components.client.company.CompanyReviews.result')}
            rules={[{ required: true, message: i18next.t('app:components.client.company.CompanyReviews.required') }]}
          >
            <Radio.Group
              optionType='button'
              options={Object.entries(OUTCOME).map(([value, meta]) => ({
                value,
                label: meta.label,
              }))}
            />
          </Form.Item>
          <Form.Item
            name='experience'
            label={i18next.t('app:components.client.company.CompanyReviews.overall_experience')}
            rules={[{ required: true, message: i18next.t('app:components.client.company.CompanyReviews.required') }]}
          >
            <Radio.Group
              optionType='button'
              options={[
                { value: 'positive', label: i18next.t('app:components.client.company.CompanyReviews.positive') },
                { value: 'neutral', label: i18next.t('app:components.client.company.CompanyReviews.neutral') },
                { value: 'negative', label: i18next.t('app:components.client.company.CompanyReviews.negative') },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item
          name='difficulty'
          label={i18next.t('app:components.client.company.CompanyReviews.difficulty')}
          rules={[{ required: true, message: i18next.t('app:components.client.company.CompanyReviews.required') }]}
        >
          <Rate tooltips={DIFFICULTY} />
        </Form.Item>
        <Form.Item
          name='process'
          label={i18next.t('app:components.client.company.CompanyReviews.how_did_the_process_go')}
          rules={[{ required: true, min: 30, message: i18next.t('app:components.client.company.CompanyReviews.at_least_30_characters') }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            maxLength={3000}
            showCount
            placeholder={i18next.t('app:components.client.company.CompanyReviews.rounds_duration_who_you_met_take')}
          />
        </Form.Item>
        <Form.Item name='questions' label={i18next.t('app:components.client.company.CompanyReviews.questions_asked_optional')}>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} maxLength={3000} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyReviews;
