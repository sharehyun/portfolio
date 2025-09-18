
from django.urls import path,include
from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = 'neews'

urlpatterns = [
    path('',views.gobookneews,name='gobookneews'),
    
    path('chart/join/', views.join_chart_data),
    path('chart/genre/', views.genre_chart_data),
    path('chart/tag/', views.tag_chart_data),
    path('chart/share/', views.share_chart_data),
    path('chart/review/', views.review_chart_data),

]

urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)