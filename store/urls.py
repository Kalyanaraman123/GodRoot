from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),

    # shop app
    path('', include(('shop.urls', 'shop'), namespace='shop')),

    # --- add this profile route ---
    path(
        'accounts/profile/',
        login_required(TemplateView.as_view(template_name='registration/profile.html')),
        name='profile'
    ),

    # auth routes (built-in Django login/logout/password management)
    path('accounts/', include('django.contrib.auth.urls')),

    # shortcuts
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
]
