from booksearch.models import Book
from django.db.models import Sum

def review_count_processor(request):
    count = Book.objects.aggregate(Sum('review_count'))['review_count__sum'] or 0
    return {'review_count': count}
