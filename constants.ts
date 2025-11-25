import { CategoryData, Product, Purchase } from './types';

export const CATEGORIES: CategoryData[] = [
  { name: 'Grãos & Base', items: ['Arroz', 'Feijão', 'Farinha de Trigo', 'Macarrão', 'Açúcar', 'Sal', 'Café', 'Óleo'] },
  { name: 'Carnes & Proteínas', items: ['Frango (Peito)', 'Carne Moída', 'Bife Bovino', 'Carne Suína', 'Peixe', 'Ovos'] },
  { name: 'Laticínios', items: ['Leite', 'Manteiga', 'Queijo Mussarela', 'Iogurte', 'Requeijão'] },
  { name: 'Frutas', items: ['Banana', 'Maçã', 'Uva', 'Mamão', 'Laranja', 'Limão'] },
  { name: 'Legumes', items: ['Batata', 'Cebola', 'Cenoura', 'Tomate', 'Pimentão'] },
  { name: 'Verduras', items: ['Alface', 'Couve', 'Rúcula', 'Espinafre', 'Cheiro Verde'] },
  { name: 'Higiene', items: ['Sabonete', 'Shampoo', 'Condicionador', 'Papel Higiênico', 'Pasta de Dente', 'Desodorante'] },
  { name: 'Limpeza', items: ['Sabão em Pó', 'Amaciante', 'Detergente', 'Água Sanitária', 'Desinfetante', 'Esponja'] },
  { name: 'Bebidas', items: ['Água Mineral', 'Refrigerante', 'Suco', 'Cerveja'] },
  { name: 'Padaria', items: ['Pão de Forma', 'Pão Francês', 'Torrada', 'Biscoito'] },
];

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const INITIAL_PRODUCTS: Product[] = CATEGORIES.flatMap(cat => 
  cat.items.map(name => ({
    id: generateId(),
    name,
    category: cat.name,
    defaultUnit: 'un'
  }))
);
