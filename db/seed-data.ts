export const SEED_EMAIL_DOMAIN = "seed.example.com";

// [nome, preço em reais, descrição]
type Item = [string, number, string];

export const seedCategories: {
  name: string;
  addons: [string, number][];
  items: Item[];
}[] = [
  {
    name: "Pizza",
    addons: [["Borda recheada", 6], ["Queijo extra", 4], ["Bacon", 5]],
    items: [
      ["Pizza Margherita", 29.99, "Molho de tomate, mussarela e manjericão fresco."],
      ["Pizza Calabresa", 32.9, "Calabresa fatiada, cebola e mussarela."],
      ["Pizza Quatro Queijos", 39.9, "Mussarela, provolone, parmesão e gorgonzola."],
      ["Pizza Portuguesa", 36.9, "Presunto, ovos, cebola, azeitonas e mussarela."],
      ["Pizza Frango com Catupiry", 37.9, "Frango desfiado temperado com catupiry cremoso."],
    ],
  },
  {
    name: "Hambúrguer",
    addons: [["Bacon", 5], ["Queijo extra", 3], ["Ovo", 2.5]],
    items: [
      ["Hambúrguer Clássico", 19.99, "Hambúrguer com queijo, alface, tomate e molho especial."],
      ["X-Bacon", 24.9, "Hambúrguer, queijo e bacon crocante no pão brioche."],
      ["X-Salada", 21.9, "Hambúrguer, queijo, alface, tomate e cebola roxa."],
      ["Hambúrguer Duplo", 29.9, "Dois hambúrgueres, queijo cheddar e molho da casa."],
      ["Hambúrguer de Frango", 22.9, "Filé de frango empanado, alface e maionese temperada."],
    ],
  },
  {
    name: "Sushi",
    addons: [["Shoyu extra", 1.5], ["Gengibre extra", 1], ["Cream cheese", 3]],
    items: [
      ["Sushi Mix", 39.99, "Seleção de sushi fresco com salmão, atum e camarão."],
      ["Combinado 20 Peças", 54.9, "Sushis, uramakis e sashimis variados."],
      ["Temaki de Salmão", 24.9, "Cone de alga recheado com salmão e cebolinha."],
      ["Hot Roll", 28.9, "Rolinho empanado e frito, recheado com salmão."],
      ["Sashimi de Salmão", 42.9, "Dez fatias de salmão fresco."],
    ],
  },
  {
    name: "Salada",
    addons: [["Frango extra", 6], ["Molho extra", 2], ["Parmesão", 3]],
    items: [
      ["Salada Caesar", 14.99, "Alface, frango grelhado, croutons e molho Caesar."],
      ["Salada Caprese", 16.9, "Tomate, mussarela de búfala e manjericão."],
      ["Salada Tropical", 15.9, "Folhas verdes, manga, castanhas e molho de maracujá."],
      ["Salada Grega", 17.9, "Pepino, tomate, azeitonas, cebola roxa e queijo feta."],
      ["Salada de Atum", 18.9, "Mix de folhas, atum, ovo cozido e tomate cereja."],
    ],
  },
  {
    name: "Massas",
    addons: [["Queijo ralado extra", 2], ["Molho extra", 3], ["Frango desfiado", 6]],
    items: [
      ["Espaguete à Bolonhesa", 27.9, "Espaguete com molho de carne moída e tomate."],
      ["Fettuccine Alfredo", 29.9, "Fettuccine ao molho cremoso de queijo parmesão."],
      ["Lasanha de Carne", 31.9, "Camadas de massa, carne, molho branco e queijo gratinado."],
      ["Penne ao Pesto", 28.9, "Penne com molho pesto de manjericão e pinoli."],
      ["Nhoque ao Sugo", 26.9, "Nhoque de batata com molho de tomate fresco."],
    ],
  },
  {
    name: "Sobremesas",
    addons: [["Calda extra", 2], ["Bola de sorvete", 5]],
    items: [
      ["Petit Gâteau", 18.9, "Bolinho de chocolate com centro cremoso quente."],
      ["Pudim de Leite", 9.9, "Pudim cremoso de leite condensado com calda de caramelo."],
      ["Brownie com Sorvete", 16.9, "Brownie de chocolate com sorvete de creme."],
      ["Mousse de Maracujá", 8.9, "Mousse aerada de maracujá com calda da fruta."],
      ["Cheesecake de Frutas Vermelhas", 14.9, "Torta de cream cheese com geleia de frutas vermelhas."],
    ],
  },
  {
    name: "Bebidas",
    addons: [],
    items: [
      ["Suco de Laranja", 8.9, "Suco natural de laranja, 400 ml."],
      ["Limonada Suíça", 9.9, "Limão batido com leite condensado, 400 ml."],
      ["Refrigerante Lata", 6, "Lata de 350 ml, vários sabores."],
      ["Água Mineral", 4, "Garrafa de 500 ml, com ou sem gás."],
      ["Cerveja Long Neck", 12, "Long neck gelada de 330 ml."],
    ],
  },
  {
    name: "Porções",
    addons: [["Molho extra", 3], ["Cheddar e bacon", 8]],
    items: [
      ["Batata Frita", 22.9, "Porção de batata frita crocante."],
      ["Onion Rings", 19.9, "Anéis de cebola empanados e fritos."],
      ["Frango Empanado", 26.9, "Tiras de frango empanadas com molho barbecue."],
      ["Mandioca Frita", 18.9, "Mandioca frita sequinha, com sal e alho."],
      ["Bolinho de Bacalhau", 29.9, "Doze bolinhos de bacalhau crocantes."],
    ],
  },
];

export const seedZones = [
  { name: "Centro", neighborhood: "Centro", feeCents: 500, minOrderCents: 0 },
  { name: "Jardim das Flores", neighborhood: "Jardim das Flores", feeCents: 600, minOrderCents: 0 },
  { name: "Vila Nova", neighborhood: "Vila Nova", feeCents: 700, minOrderCents: 1500 },
  { name: "Boa Vista", neighborhood: "Boa Vista", feeCents: 700, minOrderCents: 1500 },
  { name: "Alto da Colina", neighborhood: "Alto da Colina", feeCents: 900, minOrderCents: 2500 },
  { name: "Parque Verde", neighborhood: "Parque Verde", feeCents: 900, minOrderCents: 2500 },
  { name: "Zona Norte", neighborhood: "Zona Norte", feeCents: 800, minOrderCents: 2000 },
  { name: "Zona Sul", neighborhood: "Zona Sul", feeCents: 800, minOrderCents: 2000 },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

export const seedCoupons: {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderCents: number;
  active: boolean;
  validUntil?: Date;
}[] = [
  { code: "BEMVINDO10", discountType: "percent", discountValue: 10, minOrderCents: 0, active: true },
  { code: "SABOR15", discountType: "percent", discountValue: 15, minOrderCents: 5000, active: true },
  { code: "FRETE5", discountType: "fixed", discountValue: 500, minOrderCents: 3000, active: true },
  { code: "MAIS10", discountType: "fixed", discountValue: 1000, minOrderCents: 6000, active: true },
  { code: "VERAO20", discountType: "percent", discountValue: 20, minOrderCents: 4000, active: true, validUntil: daysAgo(30) },
  { code: "TESTE", discountType: "percent", discountValue: 5, minOrderCents: 0, active: false },
];

export const reviewComments: Record<number, string[]> = {
  5: ["Perfeito, chegou quentinho e muito saboroso!", "Melhor que já pedi, voltarei com certeza.", "Ótima porção e entrega rápida."],
  4: ["Muito bom, só demorou um pouco.", "Gostoso e bem servido.", "Boa qualidade, recomendo."],
  3: ["Bom, mas esperava um pouco mais de tempero.", "Estava ok, nada de especial."],
  2: ["Chegou morno e meio seco.", "A porção veio menor do que eu esperava."],
  1: ["Pedido veio errado e frio.", "Não gostei, não pedirei de novo."],
};

export const orderNotes = [
  "Sem cebola, por favor.",
  "Tocar o interfone.",
  "Enviar guardanapos extras.",
  "Deixar com o porteiro.",
  "Ponto da carne bem passado.",
];

export const cancelNotes = [
  "Cliente desistiu do pedido.",
  "Pagamento não aprovado.",
  "Item indisponível no momento.",
];