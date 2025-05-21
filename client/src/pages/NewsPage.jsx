import { useEffect, useState } from 'react'
import { Container, Card } from 'react-bootstrap'
import { newsApi } from '../api'


export default function NewsPage() {
    const [news, setNews] = useState([])

    useEffect(() => {
        // const fetchNews = async () => {
        //     const res = await newsApi.getAll()
            
        //     setNews(res.data)
        // }

        const fetchNews = async () => {
            const res = await newsApi.getAll()

            const sortedNews = res.data.sort((a, b) =>
                new Date(b.publication_date) - new Date(a.publication_date)
            )

            setNews(sortedNews)
        }

        fetchNews()
    }, [])


    

    return (
        <Container className="mt-4 mb-4">
            <h2 className="mb-4">Новости</h2>

            {news.map((item) => (
                <Card key={item.news_id} className="mb-3">
                    <Card.Body>
                        <Card.Title>{item.title}</Card.Title>
                        <Card.Img
                            variant="top"
                            src={`http://localhost:8000/images/news/${item.news_id}`}
                            alt={item.title}
                            style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Text>{item.content}</Card.Text>
                        <Card.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {new Date(item.publication_date).toLocaleString()}
                        </Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    )
}
