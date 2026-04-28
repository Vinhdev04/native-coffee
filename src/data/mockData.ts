/**
 * Mock data - Native Coffee App
 * Dùng khi chưa kết nối API thật
 */

export const mockCategories = [
  { id: 'all',         name: 'Tất cả',        icon: '☕' },
  { id: 'coffee',      name: 'Cà phê',         icon: '☕' },
  { id: 'milk-tea',    name: 'Trà sữa',        icon: '🧋' },
  { id: 'fruit-tea',   name: 'Trà trái cây',   icon: '🍵' },
  { id: 'ice-blended', name: 'Đá xay',         icon: '🥤' },
  { id: 'smoothie',    name: 'Sinh tố',        icon: '🍓' },
];

export const mockProducts = [
  {
    id:          'cf-001',
    name:        'Cà Phê Đen Đá',
    categoryId:  'coffee',
    category:    'Cà phê',
    price:       35000,
    description: 'Espresso đậm vị, đắng thanh, đá lạnh sảng khoái.',
    image:       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id:          'cf-002',
    name:        'Bạc Xỉu Đá',
    categoryId:  'coffee',
    category:    'Cà phê',
    price:       38000,
    description: 'Cà phê nhẹ, sữa đặc ngọt ngào, đá mát lạnh.',
    image:       'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    isBestSeller: false,
  },
  {
    id:          'cf-003',
    name:        'Cà Phê Muối Kem Mây',
    categoryId:  'coffee',
    category:    'Cà phê',
    price:       55000,
    description: 'Espresso đậm, kem muối mịn mướt, hậu vị cân bằng.',
    image:       'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id:          'cf-004',
    name:        'Cold Brew Sữa Tươi',
    categoryId:  'coffee',
    category:    'Cà phê',
    price:       52000,
    description: 'Cold brew ủ 12h, hòa quyện sữa tươi thơm béo.',
    image:       'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    isBestSeller: false,
  },
  {
    id:          'mt-001',
    name:        'Trà Sữa Hoàng Kim Kem Cheese',
    categoryId:  'milk-tea',
    category:    'Trà sữa',
    price:       59000,
    description: 'Nền trà đậm, kem cheese mịn và topping hoàng kim dai vừa.',
    image:       'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id:          'mt-002',
    name:        'Ô Long Nhài Trân Châu Nướng',
    categoryId:  'milk-tea',
    category:    'Trà sữa',
    price:       57000,
    description: 'Ô long nhài thanh, hậu trà sạch vị, topping nướng thơm đường đen.',
    image:       'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    isBestSeller: false,
  },
  {
    id:          'ft-001',
    name:        'Trà Đào Cam Sả',
    categoryId:  'fruit-tea',
    category:    'Trà trái cây',
    price:       45000,
    description: 'Trà đào thơm nồng sả tươi, lát cam vàng mọng nước.',
    image:       'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=800&q=80',
    isBestSeller: false,
  },
  {
    id:          'ft-002',
    name:        'Hồng Trà Vải Hoa Hồng',
    categoryId:  'fruit-tea',
    category:    'Trà trái cây',
    price:       52000,
    description: 'Vị vải rõ, nền hồng trà nhẹ, topping nha đam dễ uống.',
    image:       'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    isBestSeller: true,
  },
  {
    id:          'ib-001',
    name:        'Matcha Dâu Yến Mạch',
    categoryId:  'ice-blended',
    category:    'Đá xay',
    price:       64000,
    description: 'Matcha đá xay cùng dâu tươi, lớp sữa yến mạch nhẹ béo.',
    image:       'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80',
    isBestSeller: false,
  },
  {
    id:          'ib-002',
    name:        'Socola Đá Xay Oreo',
    categoryId:  'ice-blended',
    category:    'Đá xay',
    price:       62000,
    description: 'Socola đậm vị kết hợp oreo, phù hợp cho ngày nắng.',
    image:       'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80',
    isBestSeller: false,
  },
];

export const mockToppings = [
  { id: 'tc',  name: 'Trân châu đen',   price: 5000 },
  { id: 'tcv', name: 'Trân châu trắng', price: 5000 },
  { id: 'na',  name: 'Nha đam',         price: 5000 },
  { id: 'pp',  name: 'Pudding',          price: 7000 },
  { id: 'km',  name: 'Kem cheese',       price: 10000 },
  { id: 'xs',  name: 'Xí muội',          price: 5000 },
];

export const SIZES = ['S', 'M', 'L'];
export const SWEETNESS_LEVELS = ['0%', '25%', '50%', '75%', '100%'];
