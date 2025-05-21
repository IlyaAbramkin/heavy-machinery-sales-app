import { Container, Row, Col, Nav, Navbar, Button } from 'react-bootstrap';
import image from "/img/star-svgrepo-com.svg";

import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Layout(props) {
    const { children } = props
    const { user, logout } = useAuth();
    
    const header = (
        <header>
            <Navbar bg="light" data-bs-theme="light">
                <Container>
                <Navbar.Brand as={Link} to="/">
                    <img
                        alt=""
                        src={image}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '}
                    <b>Автоспецтехника</b>
                </Navbar.Brand>

                <Nav className="me-auto">
                    <Nav.Link as={NavLink} to="/" end>Главная</Nav.Link>
                    <Nav.Link as={NavLink} to="/catalog">Каталог</Nav.Link>
                    <Nav.Link as={NavLink} to="/news">Новости</Nav.Link>
                </Nav>

                <div className="d-flex gap-2">

                    {user ? (
                        <>
                            {user.is_admin ? (
                                <Link to="/admin">
                                    <Button variant="outline-primary">Панель управления</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/cart">
                                        <Button variant="outline-secondary">🛒Корзина</Button>
                                    </Link>
                                    <Link to="/profile">
                                        <Button variant="outline-primary">Личный кабинет</Button>
                                    </Link>
                                </>

                            )}
                            <Link to="/">
                                <Button variant="danger" onClick={logout}>Выйти</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline-primary">Войти</Button>
                            </Link>
                            <Link to="/login?mode=register">
                                <Button variant="primary">Зарегистрироваться</Button>
                            </Link>
                        </>
                    )}

                </div>
                </Container>
            </Navbar>
        </header>
    )

    const footer = (
        <footer className="bg-light mt-5 py-4">
            <Container>
                <Row>
                <Col md={4} className="mb-4">
                    <h5>Автоспецтехника</h5>
                    <p className="text-muted">
                    Продажа и сервис автомобильной и специальной техники для различных отраслей.
                    </p>
                </Col>

                <Col md={4} className="mb-4">
                    <h5>Разделы</h5>
                    <Nav className="flex-column">
                    <Nav.Link as={NavLink} to="/" className="p-0">Главная</Nav.Link>
                    <Nav.Link as={NavLink} to="/catalog" className="p-0">Каталог</Nav.Link>
                    <Nav.Link as={NavLink} to="/news" className="p-0">Новости</Nav.Link>
                    </Nav>
                </Col>

                <Col md={4}>
                    <h5>Контакты</h5>
                    <p className="mb-1">Адрес: ...</p>
                    <p className="mb-1">Телефон: +8 800 555-35-35</p>
                    <p className="mb-0">Email: ...</p>
                </Col>
                </Row>

                <hr></hr>

                <Row className="mt-4">
                <Col className="text-muted">
                    <small>© {new Date().getFullYear()} Все права защищены.</small>
                </Col>
                </Row>
            </Container>
        </footer>
    )
    
    return (
        <div className="d-flex flex-column min-vh-100">
            {header}
            <main className="flex-grow-1">
                {children}
            </main>
            {footer}
        </div>
    )
}