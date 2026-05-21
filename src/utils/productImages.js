import adidasShirt from "../assets/adidas/atshirtm.png";
import adidasShirt1 from "../assets/adidas/atshirtm1.png";
import adidasShirt2 from "../assets/adidas/atshirtm2.png";
import adidasShirt3 from "../assets/adidas/atshirtm3.png";
import adidasSpezial from "../assets/adidas/spezial.png";
import adidasSpezial1 from "../assets/adidas/spezial1.png";
import adidasSpezial2 from "../assets/adidas/spezial2.png";
import adidasSpezial3 from "../assets/adidas/spezial3.png";
import carharttAccessory from "../assets/carhartt/chacce.png";
import carharttBottom from "../assets/carhartt/chbot.png";
import carharttHoodie from "../assets/carhartt/chhood.png";
import carharttSandal from "../assets/carhartt/chsand.png";
import carharttShoe from "../assets/carhartt/chshoe.png";
import carharttTop from "../assets/carhartt/chtop.png";
import nikeDunk from "../assets/nike/nikedunk.png";
import nikeDunk1 from "../assets/nike/nikedunk1.png";
import nikeDunk2 from "../assets/nike/nikedunk2.png";
import nikeDunk3 from "../assets/nike/nikedunk3.png";
import nikeDunk4 from "../assets/nike/nikedunk4.png";
import nikeShirt from "../assets/nike/ntshirt.png";
import nikeShirt1 from "../assets/nike/ntshirt1.png";
import nikeShirt2 from "../assets/nike/ntshirt2.png";
import newBalance from "../assets/nb.png";
import slingBag from "../assets/s.png";

// Additional brand images from root assets
import adidasLogo from "../assets/Adidas_logo.png";
import carharttLogo from "../assets/carhartt-logo.png";
import champion from "../assets/champion.png";
import converseLogo from "../assets/converse_logo.png";
import filaLogo from "../assets/fila_logo.png";
import hmLogo from "../assets/h&m_logo.png";
import nbLogo from "../assets/nb-logo.png";
import nikeLogo from "../assets/nike-logo.png";
import pumaLogo from "../assets/puma_logo.png";
import reebokLogo from "../assets/reebok_logo.png";
import tommy from "../assets/tommy.png";
import uniqloLogo from "../assets/uniqlo_logo.png";
import vans from "../assets/vans.png";

const COLOR_SWATCHES = [
  { colorName: "Black", colorHex: "#111111" },
  { colorName: "White", colorHex: "#f5f5f5" },
  { colorName: "Gray", colorHex: "#8a8f98" },
  { colorName: "Navy", colorHex: "#1f2a44" },
  { colorName: "Tan", colorHex: "#c9a574" },
];

const createVariants = (images, names = COLOR_SWATCHES) =>
  images.map((image, index) => ({
    ...(names[index] || { colorName: `Option ${index + 1}`, colorHex: "#d4d4d8" }),
    image,
  }));

const productImageSets = [
  {
    match: ["nike", "dunk", "shoe", "shoes", "sneaker"],
    fallback: nikeDunk,
    variants: createVariants([nikeDunk, nikeDunk1, nikeDunk2, nikeDunk3, nikeDunk4]),
  },
  {
    match: ["nike", "shirt", "tee", "t-shirt", "tshirt", "top"],
    fallback: nikeShirt,
    variants: createVariants([nikeShirt, nikeShirt1, nikeShirt2]),
  },
  {
    match: ["adidas", "spezial", "shoe", "shoes", "sneaker"],
    fallback: adidasSpezial,
    variants: createVariants([adidasSpezial, adidasSpezial1, adidasSpezial2, adidasSpezial3]),
  },
  {
    match: ["adidas", "shirt", "tee", "t-shirt", "tshirt", "top"],
    fallback: adidasShirt,
    variants: createVariants([adidasShirt, adidasShirt1, adidasShirt2, adidasShirt3]),
  },
  {
    match: ["carhartt", "hood", "hoodie"],
    fallback: carharttHoodie,
    variants: createVariants([carharttHoodie]),
  },
  {
    match: ["carhartt", "shoe", "shoes", "sneaker"],
    fallback: carharttShoe,
    variants: createVariants([carharttShoe]),
  },
  {
    match: ["carhartt", "sandal", "sandals"],
    fallback: carharttSandal,
    variants: createVariants([carharttSandal]),
  },
  {
    match: ["carhartt", "bag", "accessory", "accessories"],
    fallback: carharttAccessory,
    variants: createVariants([carharttAccessory]),
  },
  {
    match: ["carhartt", "pant", "pants", "bottom", "trouser"],
    fallback: carharttBottom,
    variants: createVariants([carharttBottom]),
  },
  {
    match: ["carhartt", "top", "shirt", "tee"],
    fallback: carharttTop,
    variants: createVariants([carharttTop]),
  },
  {
    match: ["new balance", "basic", "tee", "shirt", "nb"],
    fallback: newBalance,
    variants: createVariants([newBalance]),
  },
  {
    match: ["sling", "bag"],
    fallback: slingBag,
    variants: createVariants([slingBag]),
  },
  // Brand-specific fallbacks (category/subcategory based)
  {
    match: ["nike"],
    fallback: nikeLogo,
    variants: createVariants([nikeLogo]),
  },
  {
    match: ["adidas"],
    fallback: adidasLogo,
    variants: createVariants([adidasLogo]),
  },
  {
    match: ["carhartt"],
    fallback: carharttLogo,
    variants: createVariants([carharttLogo]),
  },
  {
    match: ["champion"],
    fallback: champion,
    variants: createVariants([champion]),
  },
  {
    match: ["converse"],
    fallback: converseLogo,
    variants: createVariants([converseLogo]),
  },
  {
    match: ["fila"],
    fallback: filaLogo,
    variants: createVariants([filaLogo]),
  },
  {
    match: ["h&m", "hm"],
    fallback: hmLogo,
    variants: createVariants([hmLogo]),
  },
  {
    match: ["puma"],
    fallback: pumaLogo,
    variants: createVariants([pumaLogo]),
  },
  {
    match: ["reebok"],
    fallback: reebokLogo,
    variants: createVariants([reebokLogo]),
  },
  {
    match: ["tommy", "tommy hilfiger"],
    fallback: tommy,
    variants: createVariants([tommy]),
  },
  {
    match: ["uniqlo"],
    fallback: uniqloLogo,
    variants: createVariants([uniqloLogo]),
  },
  {
    match: ["vans", "shoe", "shoes"],
    fallback: vans,
    variants: createVariants([vans]),
  },
];

const normalize = (value) => String(value || "").trim().toLowerCase();

const isLocalOrRemoteImage = (image) =>
  typeof image === "string" &&
  (image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/") ||
    image.startsWith("data:image"));

export const resolveProductImages = (product = {}) => {
  const image = product.image || product.image_url || product.img;

  if (isLocalOrRemoteImage(image)) {
    return {
      img: image,
      variants: createVariants([image], [{ colorName: "Default", colorHex: "#111111" }]),
    };
  }

  const searchable = normalize(
    [product.name, product.title, product.brand, product.category, product.subCategory, image].join(" ")
  );

  const matchedSet = productImageSets.find(({ match }) =>
    match.some((keyword) => searchable.includes(keyword))
  );

  if (!matchedSet) {
    return {
      img: newBalance,
      variants: createVariants([newBalance], [{ colorName: "Default", colorHex: "#111111" }]),
    };
  }

  return {
    img: matchedSet.fallback,
    variants: matchedSet.variants,
  };
};

export const formatProductForFrontend = (product = {}) => {
  const images = resolveProductImages(product);
  const isShoe =
    String(product.category || product.subCategory || "").toLowerCase().includes("shoe") ||
    String(product.name || product.title || "").toLowerCase().match(/dunk|spezial|sneaker|shoe|sandal/);

  return {
    id: product.id,
    title: product.name || product.title || "Unnamed",
    brand: product.brand || "Unknown",
    category: product.category || "General",
    subCategory: product.subCategory || "General",
    price: Number(product.price) || 0,
    sizes: product.sizes || (isShoe ? [] : ["S", "M", "L", "XL"]),
    shoeSizes: product.shoeSizes || (isShoe ? ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"] : []),
    ...images,
  };
};

export const fallbackProducts = [
  { id: 101, name: "Nike Dunk Low", brand: "Nike", category: "Shoes", subCategory: "Lifestyle", price: 120 },
  { id: 102, name: "Adidas Spezial", brand: "Adidas", category: "Shoes", subCategory: "Lifestyle", price: 110 },
  { id: 103, name: "Carhartt Hoodie", brand: "Carhartt", category: "Men", subCategory: "Hoodies", price: 85 },
  { id: 104, name: "Nike Graphic Tee", brand: "Nike", category: "Men", subCategory: "T-Shirts", price: 45 },
  { id: 105, name: "Adidas Vintage Tee", brand: "Adidas", category: "Women", subCategory: "Tops", price: 40 },
  { id: 106, name: "Carhartt Utility Pants", brand: "Carhartt", category: "Men", subCategory: "Pants", price: 95 },
  { id: 107, name: "New Balance Basic Tee", brand: "New Balance", category: "Men", subCategory: "T-Shirts", price: 35 },
].map(formatProductForFrontend);
