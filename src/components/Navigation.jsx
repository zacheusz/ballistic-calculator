import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAppConfigStore } from '../context/useAppConfigStore';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { isConfigured } = useAppContext();
  const { apiStage } = useAppConfigStore();
  const { t } = useTranslation();
  
  // For UI compatibility
  const environment = apiStage;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">{t('brandTitle')}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>{t('navHome')}</Nav.Link>
            <Nav.Link as={NavLink} to="/calculator">{t('navCalculator')}</Nav.Link>
            <Nav.Link as={NavLink} to="/config">{t('navConfig')}</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {environment && (
              <Navbar.Text className="me-3">
                {t('navEnvironment')}: <Badge bg={environment === 'prod' ? 'danger' : environment === 'stage' ? 'warning' : 'info'}>{environment}</Badge>
              </Navbar.Text>
            )}
            {isConfigured && (
              <Navbar.Text className="text-success">
                {t('navApiKeyConfigured')}
              </Navbar.Text>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
