# shop/context_processors.py
from .models import Variant  # optional, only if needed

def cart(request):
    """
    Provide a simple cart object to templates.
    This example expects cart data stored in session under 'cart' as {variant_id: quantity}.
    Adapt to your existing cart implementation if you have one.
    """
    session_cart = request.session.get('cart', {})  # e.g. {'1': 2, '3': 1}

    # Build a lightweight cart object for templates
    items = []
    total = 0
    if session_cart:
        from shop.models import Variant
        variant_ids = [int(k) for k in session_cart.keys()]
        variants = Variant.objects.filter(id__in=variant_ids)
        variant_map = {v.id: v for v in variants}
        for vid_str, qty in session_cart.items():
            try:
                vid = int(vid_str)
                variant = variant_map.get(vid)
                if not variant:
                    continue
                price = float(variant.price)
                subtotal = price * int(qty)
                items.append({
                    'variant': variant,
                    'quantity': int(qty),
                    'price': price,
                    'total_price': subtotal,
                })
                total += subtotal
            except Exception:
                continue

    class CartObj:
        def __init__(self, items, total):
            self.items = items
            self._total = total
        def get_total_price(self):
            return self._total

    return {'cart': CartObj(items, total)}
