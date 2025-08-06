import React from 'react';
import { OrderDetails } from '@/components/order-details';

interface OrderDetailsSidebarProps {
  order: any;
}

const OrderDetailsSidebar: React.FC<OrderDetailsSidebarProps> = ({ order }) => {
  return (
    <div>
      <OrderDetails order={order} />
    </div>
  );
};

export default OrderDetailsSidebar;
