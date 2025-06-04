import { OrderInputSchema } from "../types/types";
import { bookWithQuantity, orderbook } from "../orderbook";

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

  const tradeId = "#5234";
  if (side == "sell") {
    orderbook.bids.forEach((o) => {
      if (price <= o.price) {
        const fillQuantity = Math.min(quantity, o.quantity);
        o.quantity -= fillQuantity;
        bookWithQuantity.bids[o.price] =
          (bookWithQuantity.bids[o.price] || 0) - fillQuantity;
        fills.push({ price, quantity: fillQuantity, tradeId });
        quantity -= fillQuantity;

        if (o.quantity === 0) {
          console.log("delete bid");
          orderbook.bids.splice(orderbook.bids.indexOf(o), 1);
        }
      }
    });
    if (quantity != 0) {
      orderbook.asks.push({ price, quantity, orderId, side: "ask" });
      bookWithQuantity.asks[price] =
        (bookWithQuantity.asks[price] || 0) + quantity;
    }
  }
  if (side == "buy") {
    orderbook.asks.forEach((o) => {
      if (price >= o.price) {
        const fillQuantity = Math.min(quantity, o.quantity);
        o.quantity -= fillQuantity;

        bookWithQuantity.asks[o.price] =
          (bookWithQuantity.asks[o.price] || 0) - fillQuantity;
        console.log(o.quantity, "o.quantity");

        fills.push({ price: o.price, quantity: fillQuantity, tradeId });
        quantity -= fillQuantity;

        if (o.quantity === 0) {
          console.log("delete ask");
          orderbook.asks.splice(orderbook.asks.indexOf(o), 1);
        }
      }
    });

    if (quantity != 0) {
      orderbook.bids.push({ price, quantity, orderId, side: "bid" });
      bookWithQuantity.bids[price] =
        (bookWithQuantity.bids[price] || 0) + quantity;
    }
  }
  console.log(orderbook, "orderbook");
  console.log(bookWithQuantity, "bookWithQuantity");
  return res.send({
    data: { fills },
    error: null,
    message: "Order Placed successfully",
  });
};

export { order };
