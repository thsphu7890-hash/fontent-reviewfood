import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Star, MapPin, ArrowRight } from 'lucide-react';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    api.get('/restaurants').then(res => setRestaurants(res.data)).catch(err => console.error(err));
  }, []);

  const styles = {
    grid: "res-grid",
    card: "res-card",
    img: "res-img",
    content: "res-content",
    category: "res-cat",
    title: "res-title",
    info: "res-info",
    btn: "res-btn"
  };

  return (
    <div className={styles.grid}>
      <style>{`
        .res-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .res-card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee; transition: 0.3s; }
        .res-card:hover { transform: translateY(-5px); border-color: #fecaca; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        
        .res-img { width: 100%; height: 200px; object-cover: cover; }
        .res-content { padding: 20px; }
        
        .res-cat { color: #ef4444; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .res-title { font-size: 20px; font-weight: 800; color: #000; margin: 0 0 10px 0; text-decoration: none; display: block; }
        .res-info { display: flex; align-items: center; gap: 5px; color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        
        .res-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #000; color: #fff; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: 0.3s; font-size: 14px; }
        .res-btn:hover { background: #ef4444; }
      `}</style>

      {restaurants.map(res => (
        <div key={res.id} className={styles.card}>
          <img src={res.image} className={styles.img} alt={res.name} />
          <div className={styles.content}>
            <span className={styles.category}>{res.categoryName || 'Ẩm thực'}</span>
            <Link to={`/restaurant/${res.id}`} className={styles.title}>{res.name}</Link>
            <div className={styles.info}>
              <MapPin size={16} color="#ef4444" />
              <span>{res.address}</span>
            </div>
            <Link to={`/restaurant/${res.id}`} className={styles.btn}>
              XEM CHI TIẾT <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantList;