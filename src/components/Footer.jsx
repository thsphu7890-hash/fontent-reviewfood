import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const styles = {
    footer: "ft-wrapper",
    container: "ft-container",
    brandSection: "ft-brand",
    logo: "ft-logo",
    logoHighlight: "ft-logo-red",
    description: "ft-desc",
    socialWrapper: "ft-socials",
    socialIcon: "ft-icon",
    columnTitle: "ft-col-title",
    linkList: "ft-links",
    linkItem: "ft-link-item",
    contactItem: "ft-contact-item",
    contactIcon: "ft-contact-icon",
    bottom: "ft-bottom",
    copyright: "ft-copy"
  };

  return (
    <footer className={styles.footer}>
      <style>{`
        /* Đảm bảo Footer luôn chiếm 100% chiều rộng */
        .ft-wrapper { 
          background-color: #000; 
          color: #fff; 
          padding: 64px 0 32px 0; 
          margin-top: auto; 
          border-top: 1px solid #1a1a1a; 
          font-family: sans-serif;
          width: 100%;
        }

        /* Container chứa nội dung căn giữa với max-width */
        .ft-container { 
          max-width: 1200px; 
          margin: 0 auto; 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 48px; 
          padding: 0 20px; 
        }
        
        .ft-logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 16px; text-transform: uppercase; }
        .ft-logo-red { color: #ef4444; }
        .ft-desc { color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px; max-width: 280px; }
        
        .ft-socials { display: flex; gap: 16px; }
        .ft-icon { color: #9ca3af; cursor: pointer; transition: 0.3s; }
        .ft-icon:hover { color: #ef4444; }

        .ft-col-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; color: #e5e7eb; }
        .ft-links { display: flex; flex-direction: column; gap: 12px; }
        .ft-link-item { color: #6b7280; font-size: 14px; cursor: pointer; transition: 0.3s; text-decoration: none; }
        .ft-link-item:hover { color: #f87171; padding-left: 4px; }

        .ft-contact-item { display: flex; align-items: center; gap: 12px; color: #6b7280; font-size: 14px; margin-bottom: 12px; }
        .ft-contact-icon { color: #ef4444; }

        /* Phần gạch chân Copyright cũng full màn hình */
        .ft-bottom { 
          border-top: 1px solid #1a1a1a; 
          padding-top: 32px; 
          text-align: center; 
          margin-top: 48px; 
          width: 100%;
        }
        .ft-copy { color: #4b5563; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; }

        @media (max-width: 768px) {
          .ft-container { grid-template-columns: 1fr; text-align: center; }
          .ft-socials { justify-content: center; }
          .ft-contact-item { justify-content: center; }
          .ft-desc { margin-left: auto; margin-right: auto; }
        }
      `}</style>

      <div className={styles.container}>
        <div className={styles.brandSection}>
          <h3 className={styles.logo}>
            FOOD<span className={styles.logoHighlight}>REVIEW</span>
          </h3>
          <p className={styles.description}>
            Nơi kết nối đam mê ẩm thực và những đánh giá chân thực nhất từ cộng đồng sành ăn.
          </p>
          <div className={styles.socialWrapper}>
            <Facebook size={20} className={styles.socialIcon} />
            <Instagram size={20} className={styles.socialIcon} />
            <Twitter size={20} className={styles.socialIcon} />
          </div>
        </div>

        <div>
          <h4 className={styles.columnTitle}>Liên kết</h4>
          <div className={styles.linkList}>
            <span className={styles.linkItem}>Trang chủ</span>
            <span className={styles.linkItem}>Nhà hàng nổi bật</span>
            <span className={styles.linkItem}>Món ăn bán chạy</span>
            <span className={styles.linkItem}>Khuyến mãi hot</span>
          </div>
        </div>

        <div>
          <h4 className={styles.columnTitle}>Hỗ trợ</h4>
          <div className={styles.linkList}>
            <span className={styles.linkItem}>Điều khoản dịch vụ</span>
            <span className={styles.linkItem}>Chính sách bảo mật</span>
            <span className={styles.linkItem}>Khiếu nại & Góp ý</span>
          </div>
        </div>

        <div>
          <h4 className={styles.columnTitle}>Liên hệ</h4>
          <div className={styles.contactItem}>
            <Mail size={16} className={styles.contactIcon} />
            <span>support@foodreview.vn</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={16} className={styles.contactIcon} />
            <span>1900 1234</span>
          </div>
          <div className={styles.contactItem}>
            <MapPin size={16} className={styles.contactIcon} />
            <span>Quận 1, TP. Hồ Chí Minh</span>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © 2025 FoodReview Project • Design by Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;