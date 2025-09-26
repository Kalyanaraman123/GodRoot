from decimal import Decimal
from django.conf import settings
from .models import Variant

CART_SESSION_ID = 'cart'

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get(CART_SESSION_ID)
        if not cart:
            cart = self.session[CART_SESSION_ID] = {}
        self.cart = cart

    def add(self, variant_id, quantity=1):
        variant = str(variant_id)
        if variant in self.cart:
            self.cart[variant]['quantity'] += quantity
        else:
            v = Variant.objects.get(id=variant_id)
            self.cart[variant] = {'quantity': quantity, 'price': str(v.price)}
        self.save()

    def save(self):
        self.session.modified = True

    def remove(self, variant_id):
        variant = str(variant_id)
        if variant in self.cart:
            del self.cart[variant]
            self.save()

    def __iter__(self):
        ids = self.cart.keys()
        variants = Variant.objects.filter(id__in=ids)
        for v in variants:
            item = self.cart[str(v.id)]
            item['variant'] = v
            item['price'] = Decimal(item['price'])
            item['total_price'] = item['price'] * item['quantity']
            yield item

    def get_total_price(self):
        return sum(Decimal(item['price']) * item['quantity'] for item in self.cart.values())