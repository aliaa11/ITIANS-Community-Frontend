import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const storeLatestPayment = async () => {
      const token = localStorage.getItem("access-token");

      try {
        const response = await axios.get("http://localhost:8000/api/my-latest-payment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const latestPayment = response.data;
        if (latestPayment && latestPayment.id) {
          localStorage.setItem("paid_payment_id", latestPayment.id);
        }

        navigate("/employer/post-job");
      } catch (error) {
        console.error("Error fetching latest payment:", error);
        alert("حدث خطأ بعد الدفع");
      }
    };

    storeLatestPayment();
  }, [navigate]);

  return (
    <div>
      <h2>تم الدفع بنجاح، سيتم تحويلك لنشر الوظيفة...</h2>
    </div>
  );
}

export default PaymentSuccess;
