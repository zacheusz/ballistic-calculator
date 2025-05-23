import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { isConfigured } = useAppContext();
  const { t } = useTranslation();

  return (
    <Container className="my-5">
      <Row className="justify-content-center text-center">
        <Col md={8}>
          <h1 className="display-4 mb-4">{t('homeTitle')}</h1>
          <p className="lead mb-5">{t('homeSubtitle')}</p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={4}>
          <Card className="shadow mb-4">
            <Card.Body className="text-center">
              <h3>{t('homeConfigTitle')}</h3>
              <p>{t('homeConfigDesc')}</p>
              <Link to="/config">
                <Button variant="outline-primary">
                  {isConfigured ? t('homeUpdateConfig') : t('homeConfigureApp')}
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow mb-4">
            <Card.Body className="text-center">
              <h3>{t('homeCalcTitle')}</h3>
              <p>{t('homeCalcDesc')}</p>
              <Link to="/calculator">
                <Button variant="primary">
                  {t('homeStartCalc')}
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card className="border shadow-sm">
            <Card.Body className="about-api-section">
              <h4>{t('homeAboutTitle')}</h4>
              <p>
                {t('homeAboutDesc')}
              </p>
              <p className="mb-0">
                <small>
                  {t('homeApiDoc')}: <a href="https://api.calculator.snipe.technology/prod/docs/docs/openapi.yaml" target="_blank" rel="noopener noreferrer">{t('homeOpenApi')}</a>
                </small>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
