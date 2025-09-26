from django.contrib import admin
from .models import Category, Product, ProductImage, Variant, Order, OrderItem, Wishlist

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class VariantInline(admin.TabularInline):
    model = Variant
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_active')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductImageInline, VariantInline]

admin.site.register(Category)
admin.site.register(Variant)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Wishlist)