import { Link, useNavigate } from 'react-router-dom';
import styles from './header.module.scss';
import BackArrowIcon from '../../../assets/svg/backArrow.svg';
import SearchIcon from '../../../assets/svg/serach.svg';
import LogoIcon from '../../../assets/svg/logo.svg';

function Header() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <button
        type='button'
        className={styles.backArrow}
        onClick={() => {
          navigate(-1);
        }}
      >
        <img src={BackArrowIcon} alt='goto-back'></img>
      </button>
      <Link to='/main'>
        <h1 className={styles.logo}>
          <img src={LogoIcon} alt='goto-back'></img>
        </h1>
      </Link>
      <button
        type='button'
        className={styles.search}
        onClick={() => {
          navigate('/search');
        }}
      >
        <img src={SearchIcon} alt='goto-back'></img>
      </button>
    </header>
  );
}

export default Header;