import { useEffect, useState } from 'react';
import { Container, Carousel } from 'react-bootstrap';
import { newsApi } from '../api'

export default function NewsCarousel() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            const response = await newsApi.getAll();
            
            const sortedNews = response.data.sort((a, b) => 
                new Date(b.publication_date) - new Date(a.publication_date)
            ).slice(0, 3);

            setNews(sortedNews);
        };

        fetchNews();
    }, []);


    return (
        <Container className="mt-4">
            <Carousel style={{ maxHeight: '400px', overflow: 'hidden' }}>
                {news.map((item) => (
                    <Carousel.Item key={item.news_id}>
                        <img
                            className='d-block w-100'
                            src={`http://localhost:8000/images/news/${item.news_id}`}
                            alt={item.title}
                            style={{ objectFit: 'cover', height: '400px', width: '100%' }}
                        />
                        <Carousel.Caption>
                            <h3>{item.title}</h3>
                            <p>{item.content.substring(0, 100)}...</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
        </Container>
    );
}