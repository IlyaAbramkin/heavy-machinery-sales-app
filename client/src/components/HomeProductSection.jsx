import { Container, Row, Col } from 'react-bootstrap';
import CategoriesList from './CategoriesList';
import HomeVehicleList from './HomeVehicleList'


export default function HomeProductSection() {
    return (
        <Container className="mt-4">
            <Row>
                <Col md={3}>
                    <CategoriesList />
                </Col>
                <Col md={9}>
                    <HomeVehicleList />
                </Col>
            </Row>
            <Row>
            <h2 className="text-center mb-4 mt-4">Логистика</h2>
            <iframe
                src="https://azlog.ru/calc/"
                width="1300"
                height="600"
                scrolling="yes"
                title="Логистика"
            ></iframe>
            </Row>
        </Container>
    )
}