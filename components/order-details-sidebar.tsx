import React from 'react';
import { OrderDetails } from '@/components/order-details';

interface OrderDetailsSidebarProps {
  order: any;
}

const OrderDetailsSidebar: React.FC<OrderDetailsSidebarProps> = ({ order }) => {
  return (
    <div>
      {/* Other sidebar content */}
      <OrderDetails order={order} />
      {/* Other sidebar content */}
    </div>
  );
};

export default OrderDetailsSidebar;
