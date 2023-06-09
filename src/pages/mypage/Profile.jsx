import { useMutation, useQuery } from 'react-query';
import { getMypage, putEditProfile } from 'apis/mypage';
import { useEffect, useState } from 'react';
import LoadingSpinner from 'components/LoadingSpinner';
import { useNavigate } from 'react-router';
import axios from 'axios';
import styles from './mypage.module.scss';
import mypage from '../../assets/svg/mypage.svg';

function Profile() {
  const navigate = useNavigate();
  const [newNickname, setNewNickname] = useState();
  const [nicknameMessage, setNicknameMessage] = useState();
  const [profileImage, setProfileImage] = useState();
  const [image, setImage] = useState();
  const [email, setEmail] = useState();
  const [downloadImage, setDownloadImage] = useState();

  // 데이터 조회
  const { data, isLoading, isError } = useQuery('mypage', getMypage, {
    onSuccess: response => {
      setNewNickname(response.data.nickname);
      setProfileImage(response.data.imageUrl);
      setEmail(response.data.email);
    },
  });

  const mutation = useMutation(putEditProfile, {
    onSuccess: () => {
      alert('프로필 수정 성공');
      navigate('/mypage');
    },
    onError: error => {
      const { errorCode } = error.response.data;
      if (errorCode === 'InvalidToken') {
        alert('유효하지 않은 토큰입니다.');
      }
      if (errorCode === 'ExistNickname') {
        alert('이미 등록된 닉네임 입니다.');
      }
      if (errorCode === 'InvalidNicknamePattern') {
        alert('닉네임은 2~10글자로 설정해주세요.');
      }
      if (errorCode === 'Error') {
        alert('서버 에러 발생 : 프로필 수정 실패', error.msg);
      }
    },
  });

  // 닉네임 유효성 검사
  const handleChangeInput = e => {
    const nicknamePattern = /^.{2,10}$/;
    if (e.target.value.length === 0 || e.target.value.length === undefined) {
      setNicknameMessage('닉네임을 입력해주세요.');
    } else if (nicknamePattern.test(e.target.value)) {
      setNicknameMessage('');
    } else {
      setNicknameMessage('닉네임은 최소 2~10글자여야 합니다.');
    }
    setNewNickname(e.target.value);
  };

  const profileData = { profileDto: newNickname, imageFile: image };

  const handleClickSubmitProfile = e => {
    e.preventDefault();
    mutation.mutate(profileData);
  };

  // 이미지 파일을 변경한 경우, 이미지 세팅
  const handleChangeImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file) {
      reader.onload = () => {
        setProfileImage(reader.result);
        setImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 변경이 없을 경우, 다운로드 받아서 다시 세팅
  const downloadFile = async () => {
    if (!profileImage) {
      return;
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache',
        },
        responseType: 'blob',
      };
      // const modifiedUrl = profileImage.replace('https://', 'http://');
      // const response = await axios.get(modifiedUrl, {
      // const response = await axios.get(profileImage, {
      //   responseType: 'blob',
      // });
      const response = await axios.get(profileImage, config);
      setDownloadImage(response.data);
      setImage(response.data);
    } catch (err) {
      throw new Error(err);
    }
  };

  useEffect(() => {
    downloadFile();
  }, [profileImage]);

  return (
    <div className={styles.pageWrap}>
      {isLoading && <LoadingSpinner />}
      {isError && <div>데이터 처리 중 ERROR가 발생하였습니다.</div>}
      <div className={styles.pageTitleBox}>
        <h2 className={styles.pageTitle}>
          <img src={mypage} alt='mypage Icon' className={styles.profileIcon} />
          프로필 편집
        </h2>
      </div>
      <form>
        <div className={styles.profileImageBox}>
          <img src={profileImage} alt='프로필 이미지' />
          <label htmlFor='imgUpload'>
            편집
            <input
              type='file'
              name='imgUpload'
              id='imgUpload'
              onChange={e => handleChangeImageUpload(e)}
              className='hidden'
              accept='image/*'
            />
          </label>
        </div>
        <div className={styles.profileInfoBox}>
          <div>
            <div className={styles.profileInputBox}>
              <p>닉네임</p>
              <input
                type='text'
                value={newNickname}
                onChange={handleChangeInput}
              />
              <p className={styles.message}>{nicknameMessage}</p>
            </div>
            <div className={styles.profileEmailInputBox}>
              <p>이메일</p>
              <input type='text' value={email} disabled />
            </div>
          </div>
          <div className={styles.profileBtnBox}>
            <button type='submit' onClick={handleClickSubmitProfile}>
              저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Profile;
