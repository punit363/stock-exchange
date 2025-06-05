import { OrderInputSchema } from "../types/types";
import { Ask, Bid, bookWithQuantity, orderbook } from "../orderbook";

interface Fills {
  price: number;
  quantity: number;
  tradeId: string;
}

const order = async (
  req: { body: unknown },
  res: {
    send: (arg0: { data: any; error: string | null; message: string }) => any;
  }
) => {
  let order = OrderInputSchema.safeParse(req.body);

  if (!order.success) {
    return res.send({
      data: null,
      error: order.error.message,
      message: "Invalid Input",
    });
  }

  const orderId = "#23134";
  let { baseAsset, quoteAsset, price, quantity, side, type, kind } = order.data;

  //   order = {
  //     baseAsset: "INR",
  //     quoteAsset: "SOL",
  //     price: 2500,
  //     quantity: 10,
  //     side: "sell",
  //     type: "limit",
  //     kind: "ioc",
  //   };

  const fills: Fills[] = [];

  const ask_splice_indexes: number[] = [];
  const bid_splice_indexes: number[] = [];

  const tradeId = "#5234";
  let i = 0;
  if (side == "sell") {
    console.log(orderbook, "----latest-----orderbook-------");
    orderbook.bids.forEach((o: Bid) => {
      i++;
      console.log(o, "o");
      console.log(price <= o.price, "price <= o.price");
      if (price <= o.price) {
        const fillQuantity = Math.min(quantity, o.quantity);
        console.log(fillQuantity, "fillQuantity");
        o.quantity -= fillQuantity;
        bookWithQuantity.bids[o.price] =
          (bookWithQuantity.bids[o.price] || 0) - fillQuantity;
        fills.push({ price: o.price, quantity: fillQuantity, tradeId });
        quantity -= fillQuantity;
        console.log(quantity, "quantity");
        console.log(o.quantity, "o.quantity");
        if (o.quantity === 0) {
          bid_splice_indexes.push(orderbook.bids.indexOf(o));
        }
      }
      console.log(bookWithQuantity.bids[o.price], "bookwithquantity");
      if (bookWithQuantity.bids[o.price] === 0) {
        console.log(bookWithQuantity, "bookWithQuantity");
        delete bookWithQuantity.bids[o.price];
      }
    });

    if (quantity != 0) {
      //Insert order in sorted format
      const odr: Ask = { price, quantity, orderId, side: "ask" };
      const index = orderbook.asks.findIndex((el: Ask) => el.price > odr.price);

      if (index === -1) {
        orderbook.asks.push(odr);
      } else {
        orderbook.asks.splice(index, 0, odr);
      }

      bookWithQuantity.asks[price] =
        (bookWithQuantity.asks[price] || 0) + quantity;
    }
  }

  if (side == "buy") {
    orderbook.asks.forEach((o: Ask) => {
      if (price >= o.price) {
        const fillQuantity = Math.min(quantity, o.quantity);
        o.quantity -= fillQuantity;
        console.log(fillQuantity, "fill");
        bookWithQuantity.asks[o.price] =
          (bookWithQuantity.asks[o.price] || 0) - fillQuantity;
        console.log(o.quantity, "o.quantity");

        fills.push({ price: o.price, quantity: fillQuantity, tradeId });
        quantity -= fillQuantity;

        if (o.quantity === 0) {
          ask_splice_indexes.push(orderbook.asks.indexOf(o));
        }
      }

      if (bookWithQuantity.asks[o.price] === 0) {
        delete bookWithQuantity.asks[o.price];
      }
    });

    if (quantity != 0) {
      //Insert order in sorted format
      const odr: Bid = { price, quantity, orderId, side: "bid" };
      const index = orderbook.bids.findIndex((el: Bid) => el.price > odr.price);

      if (index === -1) {
        orderbook.bids.push(odr);
      } else {
        orderbook.bids.splice(index, 0, odr);
      }

      bookWithQuantity.bids[price] =
        (bookWithQuantity.bids[price] || 0) + quantity;
    }
  }

  orderbook.bids = orderbook.bids.filter(
    (_, idx) => !bid_splice_indexes.includes(idx)
  );
  orderbook.asks = orderbook.asks.filter(
    (_, idx) => !ask_splice_indexes.includes(idx)
  );

  console.log(i, "i");
  console.log("------------------------------------------");
  console.log(orderbook, "orderbook");
  console.log(bookWithQuantity, "bookWithQuantity");
  return res.send({
    data: { fills },
    error: null,
    message: "Order Placed successfully",
  });
};

export { order };
