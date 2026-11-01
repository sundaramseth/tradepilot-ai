"""TradePilot AI: local-only paper trading demonstration. No broker integration."""
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="TradePilot AI Paper MVP")
cash = Decimal("1000.00")
position = None
trades = []
running = False

class Quote(BaseModel):
    symbol: str = Field(pattern=r"^[A-Z0-9._-]{1,24}$")
    price: Decimal = Field(gt=0)

class Buy(Quote):
    quantity: int = Field(gt=0)
    stop_loss: Decimal = Field(gt=0)
    target: Decimal = Field(gt=0)

@app.get("/health")
def health():
    return {"status": "ok", "mode": "PAPER_ONLY"}

@app.get("/status")
def status():
    return {"mode": "PAPER_ONLY", "cash": str(cash), "position": position, "trades": trades, "bot_running": running}

@app.post("/bot/start")
def start():
    global running
    running = True
    return {"bot_running": True, "note": "No automatic trading signals implemented"}

@app.post("/bot/stop")
def stop():
    global running
    running = False
    return {"bot_running": False}

@app.post("/paper/buy")
def buy(order: Buy):
    global cash, position
    if not running: raise HTTPException(400, "Bot is stopped")
    if position: raise HTTPException(400, "Only one position allowed")
    if len(trades) >= 2: raise HTTPException(400, "Trade limit reached")
    if not order.stop_loss < order.price < order.target: raise HTTPException(400, "Invalid stop or target")
    cost = order.price * order.quantity
    if (order.price - order.stop_loss) * order.quantity > Decimal("10"): raise HTTPException(400, "Risk exceeds 10")
    if cost > cash: raise HTTPException(400, "Insufficient virtual cash")
    if sum((Decimal(t["pnl"]) for t in trades), Decimal(0)) <= Decimal("-20"): raise HTTPException(400, "Loss limit reached")
    cash -= cost
    position = {"symbol": order.symbol, "entry": str(order.price), "quantity": order.quantity, "stop_loss": str(order.stop_loss), "target": str(order.target)}
    return status()

@app.post("/paper/quote")
def quote(q: Quote):
    """Caller-supplied fake price, not a live market quote."""
    global cash, position
    if not position or q.symbol != position["symbol"]: raise HTTPException(404, "No matching position")
    stop, target = Decimal(position["stop_loss"]), Decimal(position["target"])
    if stop < q.price < target: return {"action": "HOLD", "position": position}
    entry, qty = Decimal(position["entry"]), position["quantity"]
    pnl = (q.price - entry) * qty
    cash += q.price * qty
    result = {"symbol": q.symbol, "entry": str(entry), "exit": str(q.price), "quantity": qty, "pnl": str(pnl), "reason": "STOP_LOSS" if q.price <= stop else "TARGET", "time": datetime.now(timezone.utc).isoformat()}
    trades.append(result)
    position = None
    return {"action": "SELL", "trade": result, "cash": str(cash)}
