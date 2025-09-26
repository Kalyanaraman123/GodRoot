from django.urls import path
from . import views

app_name = 'shop'

urlpatterns = [
    path('', views.home, name='home'),
    path('products/<slug:slug>/', views.product_detail, name='product_detail'),
    path('quick-view/<int:pk>/', views.quick_view, name='quick_view'),
    path('cart/', views.cart_view, name='cart'),
    path('cart/add/<int:variant_id>/', views.cart_add, name='cart_add'),
    path('checkout/', views.checkout, name='checkout'),
    path('payment/verify/', views.payment_verify, name='payment_verify'),
]