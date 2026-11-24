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

import i18next from 'i18next';

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
    if (!res?.data) throw new Error(res?.message ?? i18next.t('app:components.client.modal.apply_modal.cannot_load_this_cv'));
    const file = await renderCvPdfFile(res.data);
    const upload = await callUploadSingleFile(file, 'resume');
    if (!upload?.data?.url) throw new Error(upload?.message ?? i18next.t('app:components.client.modal.apply_modal.cannot_upload_the_cv'));
    return upload.data.url as string;
  };

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleOkButton = async () => {
    if (isAuthenticated && source === 'online' && !cvId) {
      message.error(i18next.t('app:components.client.modal.apply_modal.please_choose_one_of_your_cvs'));
      return;
    }
    if (isAuthenticated && source === 'upload' && !urlCV) {
      message.error(i18next.t('app:components.client.modal.apply_modal.please_upload_a_file_cv'));
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
              message: i18next.t('app:components.client.modal.apply_modal.cannot_prepare_your_cv'),
              description: (error as Error).message,
            });
            return;
          }
        }
        const res = await callCreateResume(cvUrl, jobDetail?.company?._id, jobDetail?._id);
        setIsSubmitting(false);
        if (res.data) {
          message.success(i18next.t('app:components.client.modal.apply_modal.your_application_has_been_sent'));
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
            message: i18next.t('app:components.client.modal.apply_modal.error_uploading_cv'),
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
        message.error(i18next.t('app:components.client.modal.apply_modal.only_pdf_doc_or_docx_files'));
        return Upload.LIST_IGNORE;
      }
      if (file.size > CV_MAX_SIZE) {
        message.error(i18next.t('app:components.client.modal.apply_modal.your_cv_must_be_smaller_than'));
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
        message.success(i18next.t('app:components.client.modal.apply_modal.file_uploaded_successfully', { v0: info.file.name }));
      } else if (info.file.status === 'error') {
        message.error(info?.file?.error?.event?.message ?? i18next.t('app:components.client.modal.apply_modal.da_co_loi_xay_ra_khi'));
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
          <small>{i18next.t('app:components.client.modal.apply_modal.apply_for')}</small>
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
              <p className={s['label']}>{i18next.t('app:components.client.modal.apply_modal.applying_as')}</p>
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
              <p className={s['label']}>{i18next.t('app:components.client.modal.apply_modal.your_cv')}</p>
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
                    <b>{i18next.t('app:components.client.modal.apply_modal.online_cv')}</b>
                    <small>{myCvs.length ? i18next.t('app:components.client.modal.apply_modal.saved', { v0: myCvs.length }) : i18next.t('app:components.client.modal.apply_modal.build_one_for_free')}</small>
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
                    <b>{i18next.t('app:components.client.modal.apply_modal.upload_a_file')}</b>
                    <small>{i18next.t('app:components.client.modal.apply_modal.pdf_doc_docx_max_5mb')}</small>
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
                      <span>{i18next.t('app:components.client.modal.apply_modal.the_latest_version_is_exported_to')}</span>
                      <Link to='/cv' onClick={() => setIsModalOpen(false)}>
                        {i18next.t('app:components.client.modal.apply_modal.manage_cvs')}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className={s['empty']}>
                    <p>{i18next.t('app:components.client.modal.apply_modal.you_have_no_online_cv_yet')}</p>
                    <Link to='/cv' onClick={() => setIsModalOpen(false)}>
                      <Button icon={<PlusOutlined />}>{i18next.t('app:components.client.modal.apply_modal.create_a_cv_in_minutes')}</Button>
                    </Link>
                  </div>
                )
              ) : (
                <div className={s['dragger']}>
                  <Upload.Dragger {...propsUpload}>
                    <p className='ant-upload-drag-icon'>
                      <InboxOutlined />
                    </p>
                    <p className='ant-upload-text'>{i18next.t('app:components.client.modal.apply_modal.click_or_drag_your_cv_here')}</p>
                    <p className='ant-upload-hint'>{i18next.t('app:components.client.modal.apply_modal.supports_pdf_doc_docx_up_to')}</p>
                  </Upload.Dragger>
                </div>
              )}
            </section>
          </div>

          <div className={s['foot']}>
            <span className={s['privacy']}>
              <LockOutlined /> {i18next.t('app:components.client.modal.apply_modal.shared_only_with_this_employer')}
            </span>
            <div className={s['actions']}>
              <Button onClick={() => setIsModalOpen(false)}>{i18next.t('app:common.cancel')}</Button>
              <Button
                type='primary'
                className={s['submit']}
                icon={<SendOutlined />}
                loading={isSubmitting}
                disabled={!canSubmit}
                onClick={handleOkButton}
              >
                {isSubmitting ? i18next.t('app:components.client.modal.apply_modal.sending') : i18next.t('app:components.client.modal.apply_modal.submit_application')}
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
            <h4>{i18next.t('app:components.client.modal.apply_modal.sign_in_to_apply')}</h4>
            <p>{i18next.t('app:components.client.modal.apply_modal.log_in_to_send_your_cv')}</p>
          </div>
          <div className={s['foot']}>
            <span />
            <div className={s['actions']}>
              <Button onClick={() => setIsModalOpen(false)}>{i18next.t('app:common.cancel')}</Button>
              <Button type='primary' className={s['submit']} onClick={handleOkButton}>
                {i18next.t('app:components.client.modal.apply_modal.log_in_to_apply')}
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
export default ApplyModal;
