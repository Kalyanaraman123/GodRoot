# shop/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.conf import settings

import razorpay

from .models import Product, Variant, Order, Category
from .cart import Cart

# initialize razorpay client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def home(request):
    """
    Homepage: show active products and categories.
    Use Cart(request) so templates can read cart data safely.
    """
    products = Product.objects.filter(is_active=True).order_by('-created_at')[:24]
    categories = Category.objects.all()

    # create cart instance from session/request
    cart = Cart(request)

    return render(request, 'shop/home.html', {
        'products': products,
        'categories': categories,
        'cart': cart,
    })


def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    cart = Cart(request)
    return render(request, 'shop/product_detail.html', {'product': product, 'cart': cart})


def quick_view(request, pk):
    product = get_object_or_404(Product, pk=pk, is_active=True)
    return render(request, 'shop/quick_view.html', {'product': product})


def cart_view(request):
    cart = Cart(request)
    return render(request, 'shop/cart.html', {'cart': cart})


def cart_add(request, variant_id):
    if request.method == 'POST':
        qty = int(request.POST.get('quantity', 1))
        cart = Cart(request)
        cart.add(variant_id, qty)
        # If you prefer JSON response for AJAX:
        return JsonResponse({'success': True, 'cart_count': len(cart)})
    return HttpResponseBadRequest()


def checkout(request):
    cart = Cart(request)
    if request.method == 'POST':
        total_paise = int(cart.get_total_price() * 100)  # razorpay needs integer paise
        razor_order = client.order.create({'amount': total_paise, 'currency': 'INR', 'payment_capture': '1'})
        # Create local Order entry
        order = Order.objects.create(total_amount=cart.get_total_price())
        return render(request, 'shop/checkout_payment.html', {
            'order': order,
            'razor_order': razor_order,
            'key_id': settings.RAZORPAY_KEY_ID
        })
    return render(request, 'shop/checkout.html', {'cart': cart})


def payment_verify(request):
    if request.method == 'POST':
        # Expecting AJAX post from checkout handler; implement signature verification here
        # Example (pseudo):
        # payload = json.loads(request.body)
        # verify signature using razorpay.Utility().verify_payment_signature(...)
        # update Order status
        return JsonResponse({'status': 'ok'})
    return HttpResponseBadRequest()
