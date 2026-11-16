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

const PAGE_SIZE = 5;

const CATEGORIES: { key: keyof NonNullable<ICompanyReview['ratings']>; label: string }[] = [
  { key: 'salary', label: 'Salary & benefits' },
  { key: 'culture', label: 'Culture & fun' },
  { key: 'management', label: 'Management' },
  { key: 'workLifeBalance', label: 'Work-life balance' },
  { key: 'growth', label: 'Career growth' },
];

const OUTCOME = {
  offer: { label: 'Got an offer', color: 'green' },
  no_offer: { label: 'No offer', color: 'red' },
  pending: { label: 'Waiting for result', color: 'gold' },
};
const EXPERIENCE = {
  positive: { label: 'Positive experience', color: 'green' },
  neutral: { label: 'Neutral experience', color: 'default' },
  negative: { label: 'Negative experience', color: 'red' },
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
          <h2>Reviews & interviews</h2>
          <p>
            <LockOutlined /> Posted anonymously by employees and candidates of {companyName}.
          </p>
        </div>
        <div className={s['head-actions']}>
          <Button type='primary' icon={<EditOutlined />} onClick={() => startForm('review')}>
            Write a review
          </Button>
          <Button icon={<MessageOutlined />} onClick={() => startForm('interview')}>
            Share an interview
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
                  <LikeOutlined /> {r.recommendPercent}% would recommend
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
              { label: `Reviews (${total.reviews})`, value: 'reviews' },
              { label: `Interviews (${total.interviews})`, value: 'interviews' },
            ]}
          />

          {tab === 'interviews' && summary && summary.interviews.count > 0 && (
            <div className={s['interview-stats']}>
              <span>
                Difficulty <strong>{summary.interviews.difficulty.toFixed(1)}/5</strong>
              </span>
              <span>
                Positive experience <strong>{summary.interviews.positivePercent}%</strong>
              </span>
              <span>
                Got an offer <strong>{summary.interviews.offerPercent}%</strong>
              </span>
            </div>
          )}

          {list.length === 0 ? (
            <Empty
              className={s['empty']}
              description={
                tab === 'reviews'
                  ? 'No review yet. Worked here? Help others with an honest review.'
                  : 'No interview experience yet. Interviewed here? Share how it went.'
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
                            {review.recommend ? 'Recommends' : "Doesn't recommend"}
                          </Tag>
                        )}
                      </div>
                      <h3>{review.title}</h3>
                      <div className={s['author']}>
                        <UserOutlined /> Anonymous ·{' '}
                        {review.employmentStatus === 'former'
                          ? 'Former employee'
                          : 'Current employee'}
                        {review.jobTitle ? ` · ${review.jobTitle}` : ''} ·{' '}
                        {postedOn(review.createdAt)}
                      </div>
                      <div className={s['block']}>
                        <span className={s['pros']}>Pros</span>
                        <Paragraphs text={review.pros} />
                      </div>
                      <div className={s['block']}>
                        <span className={s['cons']}>Cons</span>
                        <Paragraphs text={review.cons} />
                      </div>
                      {review.advice && (
                        <div className={s['block']}>
                          <span className={s['advice']}>Advice to management</span>
                          <Paragraphs text={review.advice} />
                        </div>
                      )}
                    </article>
                  ))
                : interviews.map(interview => (
                    <article key={interview._id} className={s['item']}>
                      <h3>{interview.jobTitle}</h3>
                      <div className={s['author']}>
                        <UserOutlined /> Anonymous candidate · {postedOn(interview.createdAt)}
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
                        <span className={s['advice']}>Process</span>
                        <Paragraphs text={interview.process} />
                      </div>
                      {interview.questions && (
                        <div className={s['block']}>
                          <span className={s['advice']}>Questions asked</span>
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
                Show more
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
    <LockOutlined /> Your name, email and account are never shown. Only the month you posted is
    displayed.
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
      message.success('Thanks! Your review is now live.');
      form.resetFields();
      onDone();
    } else {
      message.error(
        Array.isArray(res?.message) ? res.message[0] : (res?.message ?? 'Cannot post the review')
      );
    }
  };

  return (
    <Modal
      open={open}
      title={`Review ${companyName}`}
      onCancel={onClose}
      onOk={submit}
      okText='Post anonymously'
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
          label='Overall rating'
          rules={[{ required: true, message: 'Please rate the company' }]}
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
          <Form.Item name='employmentStatus' label='You are a'>
            <Radio.Group
              options={[
                { label: 'Current employee', value: 'current' },
                { label: 'Former employee', value: 'former' },
              ]}
            />
          </Form.Item>
          <Form.Item name='jobTitle' label='Your position (optional)'>
            <Input placeholder='Backend Developer' maxLength={100} />
          </Form.Item>
        </div>
        <Form.Item
          name='title'
          label='Review title'
          rules={[{ required: true, min: 5, message: 'At least 5 characters' }]}
        >
          <Input placeholder='Great team, slow promotions' maxLength={120} />
        </Form.Item>
        <Form.Item
          name='pros'
          label='Pros'
          rules={[{ required: true, min: 20, message: 'At least 20 characters' }]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={2000} showCount />
        </Form.Item>
        <Form.Item
          name='cons'
          label='Cons'
          rules={[{ required: true, min: 20, message: 'At least 20 characters' }]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={2000} showCount />
        </Form.Item>
        <Form.Item name='advice' label='Advice to management (optional)'>
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={1000} />
        </Form.Item>
        <Form.Item name='recommend' label='Would you recommend this company to a friend?'>
          <Radio.Group
            options={[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
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
      message.success('Thanks for sharing your interview!');
      form.resetFields();
      onDone();
    } else {
      message.error(Array.isArray(res?.message) ? res.message[0] : (res?.message ?? 'Cannot post'));
    }
  };

  return (
    <Modal
      open={open}
      title={`Interview at ${companyName}`}
      onCancel={onClose}
      onOk={submit}
      okText='Post anonymously'
      okButtonProps={{ loading: isSubmitting }}
      width={640}
      destroyOnClose
      centered
    >
      <AnonymousNote />
      <Form form={form} layout='vertical' requiredMark={false}>
        <Form.Item
          name='jobTitle'
          label='Position you interviewed for'
          rules={[{ required: true, message: 'Please enter the position' }]}
        >
          <Input placeholder='Senior Java Developer' maxLength={100} />
        </Form.Item>
        <div className={s['form-grid']}>
          <Form.Item
            name='outcome'
            label='Result'
            rules={[{ required: true, message: 'Required' }]}
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
            label='Overall experience'
            rules={[{ required: true, message: 'Required' }]}
          >
            <Radio.Group
              optionType='button'
              options={[
                { value: 'positive', label: 'Positive' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'negative', label: 'Negative' },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item
          name='difficulty'
          label='Difficulty'
          rules={[{ required: true, message: 'Required' }]}
        >
          <Rate tooltips={DIFFICULTY} />
        </Form.Item>
        <Form.Item
          name='process'
          label='How did the process go?'
          rules={[{ required: true, min: 30, message: 'At least 30 characters' }]}
        >
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 10 }}
            maxLength={3000}
            showCount
            placeholder='Rounds, duration, who you met, take-home test…'
          />
        </Form.Item>
        <Form.Item name='questions' label='Questions asked (optional)'>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} maxLength={3000} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyReviews;
