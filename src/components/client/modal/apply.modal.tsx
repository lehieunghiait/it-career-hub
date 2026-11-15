import { IJob } from '@/types/backend';
import { Avatar, Button, Modal, Upload, message, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  CloudUploadOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  InboxOutlined,
  LockOutlined,
  PlusOutlined,
  SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { UploadProps } from 'antd';
import {
  callCreateResume,
  callFetchCvById,
  callFetchMyCvs,
  callUploadSingleFile,
} from '@/config/api';
import { useEffect, useState } from 'react';
import { CV_TEMPLATES, type ICv } from '@/components/cv/cv-model';
import { renderCvPdfFile } from '@/components/cv/cv-pdf';
import { useUser } from '@clerk/react';
import { getLocationName } from '@/config/utils';
import { useAppDispatch } from '@/redux/hooks';
import { addAppliedJob } from '@/redux/slice/appliedJobSlide';
import s from 'styles/apply-modal.module.scss';

dayjs.extend(relativeTime);

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  jobDetail: IJob | null;
}

const CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const CV_ACCEPT = CV_EXTENSIONS.join(',');
const CV_MAX_SIZE = 5 * 1024 * 1024;

const ApplyModal = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, jobDetail } = props;
  // Apply flow relies on the Clerk session; the API token is attached by axios-customize
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const isAuthenticated = isLoaded && !!isSignedIn;
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  const [urlCV, setUrlCV] = useState<string>('');
  // CV source: an online CV from the builder (exported to PDF on submit) or an uploaded file
  const [source, setSource] = useState<'online' | 'upload'>('upload');
  const [myCvs, setMyCvs] = useState<ICv[]>([]);
  const [cvId, setCvId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isModalOpen || !isAuthenticated) return;
    const load = async () => {
      const res = await callFetchMyCvs();
      const list = res?.data ?? [];
      setMyCvs(list);
      if (list.length) {
        setSource('online');
        setCvId(current => current ?? list[0]._id);
      }
    };
    load();
  }, [isModalOpen, isAuthenticated]);

  // Exports the chosen online CV to PDF and uploads it like a regular CV file
  const uploadOnlineCv = async () => {
    const res = await callFetchCvById(cvId as string);
    if (!res?.data) throw new Error(res?.message ?? 'Cannot load this CV');
    const file = await renderCvPdfFile(res.data);
    const upload = await callUploadSingleFile(file, 'resume');
    if (!upload?.data?.url) throw new Error(upload?.message ?? 'Cannot upload the CV');
    return upload.data.url as string;
  };

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleOkButton = async () => {
    if (isAuthenticated && source === 'online' && !cvId) {
      message.error('Please choose one of your CVs');
      return;
    }
    if (isAuthenticated && source === 'upload' && !urlCV) {
      message.error('Please upload a file CV!');
      return;
    }

    if (!isAuthenticated) {
      setIsModalOpen(false);
      navigate(`/login?callback=${encodeURIComponent(window.location.href)}`);
    } else {
      //todo
      if (jobDetail) {
        setIsSubmitting(true);
        let cvUrl = urlCV;
        if (source === 'online') {
          try {
            cvUrl = await uploadOnlineCv();
          } catch (error) {
            setIsSubmitting(false);
            notification.error({
              message: 'Cannot prepare your CV',
              description: (error as Error).message,
            });
            return;
          }
        }
        const res = await callCreateResume(cvUrl, jobDetail?.company?._id, jobDetail?._id);
        setIsSubmitting(false);
        if (res.data) {
          message.success('Your application has been sent!');
          dispatch(
            addAppliedJob({
              jobId: jobDetail._id as string,
              status: res.data.status ?? 'PENDING',
              appliedAt: res.data.createdAt ?? new Date().toISOString(),
            })
          );
          setIsModalOpen(false);
        } else {
          notification.error({
            message: 'Error uploading CV',
            description: res.message,
          });
        }
      }
    }
  };

  const propsUpload: UploadProps = {
    maxCount: 1,
    multiple: false,
    accept: CV_ACCEPT,
    // Same rules as the API: PDF/DOC/DOCX up to 5MB
    beforeUpload(file) {
      const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!CV_EXTENSIONS.includes(extension)) {
        message.error('Only PDF, DOC or DOCX files are accepted');
        return Upload.LIST_IGNORE;
      }
      if (file.size > CV_MAX_SIZE) {
        message.error('Your CV must be smaller than 5MB');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    async customRequest({ file, onSuccess, onError }: any) {
      const res = await callUploadSingleFile(file, 'resume');
      if (res && res.data) {
        setUrlCV(res.data.url);
        if (onSuccess) onSuccess('ok');
      } else {
        if (onError) {
          setUrlCV('');
          const error = new Error(res.message);
          onError({ event: error });
        }
      }
    },
    onRemove() {
      setUrlCV('');
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(info?.file?.error?.event?.message ?? 'Đã có lỗi xảy ra khi upload file.');
      }
    },
  };

  const salary = jobDetail?.salary
    ? `${(jobDetail.salary + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ`
    : null;
  const canSubmit = source === 'online' ? !!cvId : !!urlCV;

  return (
    <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      maskClosable={false}
      destroyOnClose
      centered
      width={560}
      footer={null}
      className={s['modal']}
    >
      <div className={s['head']}>
        <div className={s['logo']}>
          {jobDetail?.company?.logo ? (
            <img src={jobDetail.company.logo} alt={jobDetail.company.name} />
          ) : (
            jobDetail?.company?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className={s['head-copy']}>
          <small>Apply for</small>
          <h3 title={jobDetail?.name}>{jobDetail?.name}</h3>
          <p title={jobDetail?.company?.name}>{jobDetail?.company?.name}</p>
          <div className={s['chips']}>
            {jobDetail?.location && (
              <span>
                <EnvironmentOutlined /> {getLocationName(jobDetail.location)}
              </span>
            )}
            {salary && (
              <span>
                <DollarOutlined /> {salary}
              </span>
            )}
            {jobDetail?.level && <span>{jobDetail.level}</span>}
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <>
          <div className={s['body']}>
            <section className={s['section']}>
              <p className={s['label']}>Applying as</p>
              <div className={s['applicant']}>
                <Avatar src={clerkUser?.imageUrl} size={40}>
                  {clerkUser?.fullName?.charAt(0)}
                </Avatar>
                <div>
                  <b>{clerkUser?.fullName || 'Candidate'}</b>
                  <span>{email}</span>
                </div>
              </div>
            </section>

            <section className={s['section']}>
              <p className={s['label']}>Your CV</p>
              <div className={s['sources']} role='radiogroup' aria-label='CV source'>
                <button
                  type='button'
                  role='radio'
                  aria-checked={source === 'online'}
                  className={`${s['source']} ${source === 'online' ? s['active'] : ''}`}
                  onClick={() => setSource('online')}
                >
                  <span className={s['source-icon']}>
                    <FileTextOutlined />
                  </span>
                  <span>
                    <b>Online CV</b>
                    <small>{myCvs.length ? `${myCvs.length} saved` : 'Build one for free'}</small>
                  </span>
                </button>
                <button
                  type='button'
                  role='radio'
                  aria-checked={source === 'upload'}
                  className={`${s['source']} ${source === 'upload' ? s['active'] : ''}`}
                  onClick={() => setSource('upload')}
                >
                  <span className={s['source-icon']}>
                    <CloudUploadOutlined />
                  </span>
                  <span>
                    <b>Upload a file</b>
                    <small>PDF, DOC, DOCX · max 5MB</small>
                  </span>
                </button>
              </div>

              {source === 'online' ? (
                myCvs.length ? (
                  <>
                    <div className={s['cv-list']} role='radiogroup' aria-label='Online CV'>
                      {myCvs.map(cv => (
                        <button
                          key={cv._id}
                          type='button'
                          role='radio'
                          aria-checked={cvId === cv._id}
                          className={`${s['cv-item']} ${cvId === cv._id ? s['active'] : ''}`}
                          onClick={() => setCvId(cv._id)}
                        >
                          <span className={s['cv-thumb']} style={{ background: cv.color }}>
                            {(cv.data?.fullName || cv.title).trim().charAt(0).toUpperCase()}
                          </span>
                          <span className={s['cv-meta']}>
                            <b title={cv.title}>{cv.title}</b>
                            <small>
                              {CV_TEMPLATES.find(t => t.key === cv.template)?.name}
                              {cv.updatedAt &&
                                ` · edited ${dayjs(cv.updatedAt).locale('en').fromNow()}`}
                            </small>
                          </span>
                          <span className={s['radio']} />
                        </button>
                      ))}
                    </div>
                    <div className={s['hint']}>
                      <span>The latest version is exported to PDF and attached.</span>
                      <Link to='/cv' onClick={() => setIsModalOpen(false)}>
                        Manage CVs
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className={s['empty']}>
                    <p>You have no online CV yet.</p>
                    <Link to='/cv' onClick={() => setIsModalOpen(false)}>
                      <Button icon={<PlusOutlined />}>Create a CV in minutes</Button>
                    </Link>
                  </div>
                )
              ) : (
                <div className={s['dragger']}>
                  <Upload.Dragger {...propsUpload}>
                    <p className='ant-upload-drag-icon'>
                      <InboxOutlined />
                    </p>
                    <p className='ant-upload-text'>Click or drag your CV here</p>
                    <p className='ant-upload-hint'>Supports PDF, DOC, DOCX up to 5MB</p>
                  </Upload.Dragger>
                </div>
              )}
            </section>
          </div>

          <div className={s['foot']}>
            <span className={s['privacy']}>
              <LockOutlined /> Shared only with this employer
            </span>
            <div className={s['actions']}>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type='primary'
                className={s['submit']}
                icon={<SendOutlined />}
                loading={isSubmitting}
                disabled={!canSubmit}
                onClick={handleOkButton}
              >
                {isSubmitting ? 'Sending...' : 'Submit application'}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={s['guest']}>
            <div className={s['guest-icon']}>
              <LockOutlined />
            </div>
            <h4>Sign in to apply</h4>
            <p>Log in to send your CV and track this application in My jobs.</p>
          </div>
          <div className={s['foot']}>
            <span />
            <div className={s['actions']}>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type='primary' className={s['submit']} onClick={handleOkButton}>
                Log in to apply
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
export default ApplyModal;
