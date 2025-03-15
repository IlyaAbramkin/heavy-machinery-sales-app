from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import (
    Base, Category, Factory, Chassis, WheelFormula, Engine, 
    User, Vehicle, PriceList, Requests, TovaryVZayavke, News
)

DATABASE_URL = "postgresql+psycopg2://postgres:12345@localhost:5433/postgres"

def seed_data():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    Base.metadata.create_all(engine)

    category1 = Category(name="Легковые автомобили")
    category2 = Category(name="Грузовики")
    session.add_all([category1, category2])
    session.commit()

    factory1 = Factory(name="Завод A")
    factory2 = Factory(name="Завод B")
    session.add_all([factory1, factory2])
    session.commit()

    chassis1 = Chassis(name="Шасси Type 1")
    chassis2 = Chassis(name="Шасси Type 2")
    session.add_all([chassis1, chassis2])
    session.commit()

    wheel_formula1 = WheelFormula(name="4x4")
    wheel_formula2 = WheelFormula(name="4x2")
    session.add_all([wheel_formula1, wheel_formula2])
    session.commit()

    engine1 = Engine(name="Дизельный")
    engine2 = Engine(name="Бензиновый")
    session.add_all([engine1, engine2])
    session.commit()

    user1 = User(email="user1@example.com", name="Пользователь 1", password="")
    user1.set_password("password1")
    user2 = User(email="user2@example.com", name="Пользователь 2", password="")
    user2.set_password("password2")
    session.add_all([user1, user2])
    session.commit()

    vehicle1 = Vehicle(
        name="Car Model X",
        description="Описание модели X",
        category=category1,
        factory=factory1,
        chassis=chassis1,
        wheel_formula=wheel_formula1,
        engine=engine2,  # Бензиновый
        user=user1
    )
    vehicle2 = Vehicle(
        name="Truck Model Y",
        description="Описание модели Y",
        category=category2,
        factory=factory2,
        chassis=chassis2,
        wheel_formula=wheel_formula2,
        engine=engine1,  # Дизельный
        user=user2
    )
    session.add_all([vehicle1, vehicle2])
    session.commit()

    price1 = PriceList(
        price=25000,
        vehicle=vehicle1
    )
    price2 = PriceList(
        price=45000,
        vehicle=vehicle2
    )
    session.add_all([price1, price2])
    session.commit()

    request1 = Requests(
        full_name="Иван Иванов",
        email="ivanov@example.com",
        phone="+71234567890",
        city="Москва",
        message="Интересует покупка данного транспортного средства",
        status="Новый",
        user=user1
    )
    session.add(request1)
    session.commit()

    tovary1 = TovaryVZayavke(
        request_id=request1.request_id,
        vehicle_id=vehicle1.vehicle_id,
        quantity=2
    )
    session.add(tovary1)
    session.commit()

    news1 = News(
        title="Новость 1",
        content="Содержание новости 1",
        user=user1
    )
    news2 = News(
        title="Новость 2",
        content="Содержание новости 2",
        user=user2
    )
    session.add_all([news1, news2])
    session.commit()

    print("Тестовые данные успешно добавлены!")

if __name__ == "__main__":
    seed_data()
