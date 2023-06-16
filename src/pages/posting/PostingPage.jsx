import PostInput from 'components/PostInput';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import useForm from 'hooks/useForm';
import { postAddPost } from 'apis/posts';
import getPostDetail from 'apis/detail';
import { useRecoilState } from 'recoil';
import editingState from 'recoil/atom';
import SearchLocationPage from '../searchLocation/SearchLocationPage';
import SelectOptions from '../../components/SelectOptions';
import OperatingTime from './OperatingTime';
import styles from './posting.module.scss';
import AddImageIcon from '../../assets/svg/addImage.svg';
import RightArrow from '../../assets/svg/addressArrow.svg';
import IncreaseIcon from '../../assets/svg/increase.svg';
import DecreaseIcon from '../../assets/svg/decrease.svg';
import XBoxIcon from '../../assets/svg/xBox.svg';
import {
  amenityCheckList,
  holidayCheckList,
  holidayTypes,
  initialState,
  initialTime,
} from '../../utils/constants/posting';

function PostingPage() {
  const navigate = useNavigate();
  const locationValue = useLocation();
  const { postId } = { ...locationValue.state };
  const [isEditing, setIsEditing] = useRecoilState(editingState);

  // 주소
  const [location, setLocation] = useState('주소를 입력해주세요');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  // 운영 시간
  const [openTime, setOpenTime] = useState(initialTime);
  const [closeTime, setCloseTime] = useState(initialTime);
  // 휴무 옵션/체크리스트
  const [holidayType, setHolidayType] = useState(holidayTypes[0]);
  const [holidays, setHolidays] = useState(holidayCheckList);
  // 최대 인원
  const [persons, setPersons] = useState(0);
  // 편의시설 체크리스트
  const [amenityList, setAmenityList] = useState(amenityCheckList);

  const [form, handleFormChange, handleImageUpload, resetForm, setForm] =
    useForm(initialState);
  const [image, setImage] = useState([]);
  const [preImageUrl, setPreImageUrl] = useState([]);
  const { title, price, content, contentDetails } = form;

  // 수정 할 데이터 가져오기
  const { data, isLoading, isError } = useQuery(
    'postDetail',
    () => getPostDetail(postId),
    {
      onSuccess: response => {
        console.log('데이터 가져옴!! ', response.data);
        setForm(response.data);
      },
      enabled: isEditing,
    },
  );

  const mutation = useMutation(postAddPost, {
    onSuccess: () => {
      alert('포스팅 성공');
      resetForm();
      navigate('/main');
    },
    onError: error => {
      alert('서버 에러 발생 : 포스팅 실패', error.msg);
    },
  });

  const handleClickLocationOpen = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  const saveLocation = keyword => {
    setLocation(keyword);
  };

  const handleIncrease = () => {
    if (persons < 99) {
      setPersons(Number(persons) + 1);
    }
  };
  const handleDecrease = () => {
    if (persons > 0) {
      setPersons(Number(persons) - 1);
    }
  };

  const handleHolidayUpdate = e => {
    const { name, checked } = e.target;
    const newHoliday = holidays.map(day => {
      if (day.key === name) {
        return {
          ...day,
          checked,
        };
      }
      return day;
    });
    setHolidays(newHoliday);
  };

  const handleAmenitiesUpdate = e => {
    const { name, checked } = e.target;
    const newAmenityList = amenityList.map(amenity => {
      if (amenity.key === name) {
        return {
          ...amenity,
          checked,
        };
      }
      return amenity;
    });
    setAmenityList(newAmenityList);
  };

  // const handleChangeImageUpload = async e => {
  //   await handleImageUpload(e);
  // };

  // 운영 시간 데이터 형식 가공
  const getOperatingTime = () => {
    const newHolidaysData = {};
    holidays.forEach(day => {
      newHolidaysData[day.key] = day.checked;
    });

    const newOperatingTime = {
      openTime: openTime.hour + openTime.minute,
      closeTime: closeTime.hour + closeTime.minute,
      holidayTypes: holidayType,
      holidays: newHolidaysData,
    };

    return newOperatingTime;
  };

  // 편의 시설 데이터 형식 가공
  const getAmenities = () => {
    const newAmenitiesData = {};
    amenityList.forEach(amenity => {
      newAmenitiesData[amenity.key] = amenity.checked;
    });

    return newAmenitiesData;
  };

  const validation = () => {
    const numCheck = /^[0-9]+$/;
    if (!title || !price || !content || !contentDetails) {
      alert('입력란을 모두 작성해 주셔야 합니다');
      return false;
    }
    if (
      !numCheck.test(price) ||
      !numCheck.test(persons) ||
      !numCheck.test(openTime.hour) ||
      !numCheck.test(openTime.minute) ||
      !numCheck.test(closeTime.hour) ||
      !numCheck.test(closeTime.minute)
    ) {
      alert('가격, 인원, 운영 시간은 숫자로 입력해 주세요');
      return false;
    }
    if (!image) {
      alert('사진을 선택해 주세요');
      return false;
    }
    return true;
  };

  const handleClickSubmitPosting = () => {
    const operatingTimeData = getOperatingTime();
    const amenitiesData = getAmenities();

    if (validation()) {
      mutation.mutate({
        title,
        price: Number(form.price),
        capacity: Number(persons),
        content: content.replace(/\n/g, '\\n'),
        contentDetails: contentDetails.replace(/\n/g, '\\n'),
        amenities: amenitiesData,
        operatingTime: operatingTimeData,
        image,
        location,
      });
    }
  };

  const handleChangeImageUpload = e => {
    if (image.length >= 3) {
      alert('최대 3장의 이미지만 업로드 할 수 있습니다.');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const newImage = {
        imageURL: reader.result,
        file,
      };

      setPreImageUrl([...preImageUrl, newImage.imageURL]);
      setImage([...image, newImage]);
      console.log(image);
    };
  };

  // useEffect(() => {
  //   if (image) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(form.image);
  //     reader.onload = () => {
  //       setPreImageUrl(reader.result);
  //     };
  //   }
  // }, [image]);

  useEffect(() => {
    if (isEditing) {
      setLocation(location || '주소를 입력해주세요');
    } else {
      setLocation('주소를 입력해주세요');
    }
  }, [isEditing, data]);

  return (
    <>
      <div className={styles.wrap}>
        <PostInput
          type='text'
          name='title'
          value={title}
          label='글 제목'
          placeHolder='글 제목을 입력해 주세요'
          max='50'
          onChange={handleFormChange}
        ></PostInput>
        {/* 주소 */}
        <div className={`${styles.inputCon} ${styles.address}`}>
          <span type='button'>주소</span>
          <button
            type='button'
            name='content'
            onClick={handleClickLocationOpen}
          >
            {location}
            <img src={RightArrow} alt='address' />
          </button>
        </div>
        {/* 가격 */}
        <PostInput
          type='text'
          name='price'
          value={price}
          label='가격/일'
          placeHolder='ex. 50000'
          max='9'
          onChange={handleFormChange}
        ></PostInput>
        {/* 최대 인원 */}
        <div className={styles.capacity}>
          <span>최대 인원</span>
          <div className={styles.persons}>
            <button type='button' onClick={handleDecrease}>
              <img src={DecreaseIcon} alt='decrease' />
            </button>
            <input
              type='text'
              value={persons}
              maxLength='2'
              onChange={e => setPersons(e.target.value)}
            />
            <button type='button' onClick={handleIncrease}>
              <img src={IncreaseIcon} alt='increase' />
            </button>
          </div>
        </div>
        {/* 오피스 소개 */}
        <div className={styles.inputCon}>
          <span>오피스 소개</span>
          <textarea
            name='content'
            placeholder='오피스 공간에 대해 소개해 주세요'
            onChange={handleFormChange}
            value={content}
          />
        </div>
        {/* 운영 시간 */}
        <div className={styles.operatingTime}>
          <span className={styles.title}>운영 시간</span>
          <div className={styles.operatingCon}>
            <div className={styles.timeCon}>
              <OperatingTime time={openTime} setTime={setOpenTime} />
              <span>~</span>
              <OperatingTime time={closeTime} setTime={setCloseTime} />
            </div>
          </div>
          <p className={styles.holidayTitle}>
            *휴무일에 체크해 주세요<span>(연중무휴 경우 체크 x)</span>
          </p>
          <div className={styles.holidayCon}>
            <SelectOptions
              options={holidayTypes}
              selected={holidayType}
              selectedUpdate={setHolidayType}
            />
            <div className={styles.selectDays}>
              {holidays.map(day => (
                <label
                  htmlFor={day.key}
                  // key={uuid()}
                  className={`${styles.checkbox} ${
                    day.checked ? styles.checked : undefined
                  }`}
                >
                  <input
                    type='checkbox'
                    name={day.key}
                    id={day.key}
                    onChange={handleHolidayUpdate}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* 추가 안내 */}
        <div className={styles.inputCon}>
          <span>추가 안내</span>
          <textarea
            name='contentDetails'
            value={contentDetails}
            placeholder='사용 가능 시간, 환불 규정 등'
            onChange={handleFormChange}
          />
        </div>
        {/* 편의 시설 */}
        <div className={styles.amenity}>
          <span className={styles.title}>편의 시설</span>
          <div className={styles.amenities}>
            {amenityList.map(amenity => (
              <label
                htmlFor={amenity.key}
                className={`${styles.checkbox} ${
                  amenity.checked ? styles.checked : undefined
                }`}
              >
                <input
                  type='checkbox'
                  name={amenity.key}
                  id={amenity.key}
                  onChange={handleAmenitiesUpdate}
                />
                {amenity.label}
              </label>
            ))}
          </div>
        </div>
        {/* 이미지 등록 */}
        <div className={styles.inputCon}>
          <span>이미지 등록</span>
          <div className={styles.labelWrap}>
            {Array.from({ length: image.length + 1 }).map((_, index) => (
              <label htmlFor={`image${index}`} className={styles.addImage}>
                <img
                  src={(preImageUrl && preImageUrl[index]) || AddImageIcon}
                  alt='preview'
                />
                <input
                  type='file'
                  name={`image${index}`}
                  id={`image${index}`}
                  onChange={e => handleChangeImageUpload(e, index)}
                  className='hidden'
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type='button'
          className={styles.button}
          onClick={handleClickSubmitPosting}
        >
          작성 완료
        </button>
      </div>
      <div
        className={`${styles.locationCon} ${isLocationOpen && styles.slide}`}
      >
        <SearchLocationPage
          locationOpen={handleClickLocationOpen}
          saveLocation={saveLocation}
        />
      </div>
    </>
  );
}

export default PostingPage;
