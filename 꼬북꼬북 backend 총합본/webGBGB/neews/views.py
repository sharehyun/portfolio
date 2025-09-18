from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count
from collections import Counter, defaultdict
from member.models import Member
from shareMain.models import ReadingGroup
from review.models import Review
import datetime

def get_year_month(request):
    try:
        year = int(request.GET.get("year", datetime.datetime.now().year))
        month = int(request.GET.get("month", datetime.datetime.now().month))
    except:
        year = datetime.datetime.now().year
        month = datetime.datetime.now().month
    return year, month


def join_chart_data(request):
    year, month = get_year_month(request)

    all_members = Member.objects.all()
    day_counts = defaultdict(int)

    for member in all_members:
        mdate = member.mdate
        if mdate and mdate.year == year and mdate.month == month:
            day_counts[mdate.day] += 1

    sorted_days = sorted(day_counts.items())
    labels = [f"{day}일" for day, _ in sorted_days]
    data = [count for _, count in sorted_days]

    return JsonResponse({'labels': labels, 'data': data})

def genre_chart_data(request):
    year, month = get_year_month(request)
    all_members = Member.objects.all()

    genre_list = []
    for m in all_members:
        mdate = m.mdate
        if mdate and mdate.year == year and mdate.month == month:
            if m.genres:
                genre_list += [g.strip() for g in m.genres.split(',') if g.strip()]

    genre_counter = Counter(genre_list)
    top_genres = genre_counter.most_common(5)

    labels = [g[0] for g in top_genres]
    data = [g[1] for g in top_genres]
    return JsonResponse({'labels': labels, 'data': data,})


def tag_chart_data(request):
    year, month = get_year_month(request)
    all_groups = ReadingGroup.objects.all()

    tag_list = []
    for g in all_groups:
        created_at = g.created_at
        if created_at and created_at.year == year and created_at.month == month:
            if g.tag:
                tag_list += [t.strip() for t in g.tag.split(',') if t.strip()]

    tag_counter = Counter(tag_list)
    top_tags = tag_counter.most_common(5)
    
    labels = [t[0] for t in top_tags]
    data = [t[1] for t in top_tags]
    return JsonResponse({'labels': labels, 'data': data})



def share_chart_data(request):
    year, month = get_year_month(request)
    all_groups = ReadingGroup.objects.all()

    day_counts = defaultdict(int)
    for g in all_groups:
        created_at = g.created_at
        if created_at and created_at.year == year and created_at.month == month:
            day_counts[created_at.day] += 1

    sorted_days = sorted(day_counts.items())
    labels = [f"{day}일" for day, _ in sorted_days]
    data = [count for _, count in sorted_days]

    return JsonResponse({'labels': labels, 'data': data})


def review_chart_data(request):
    year, month = get_year_month(request)
    all_reviews = Review.objects.all()

    day_counts = defaultdict(int)
    for r in all_reviews:
        created_at = r.created_at
        if created_at and created_at.year == year and created_at.month == month:
            day_counts[created_at.day] += 1

    sorted_days = sorted(day_counts.items())
    labels = [f"{day}일" for day, _ in sorted_days]
    data = [count for _, count in sorted_days]

    return JsonResponse({'labels': labels, 'data': data})


def gobookneews(request):
    year, month = get_year_month(request)

    # 한 달 전체 가입자 수
    all_members = Member.objects.all()
    members = [
        m for m in all_members
        if m.mdate and m.mdate.year == year and m.mdate.month == month
    ]
    total_join = len(members)

    # 가장 많이 선택된 장르
    members = [
        m for m in all_members
        if m.mdate and m.mdate.year == year and m.mdate.month == month
    ]
    genre_list = []
    for m in members:
        if m.genres:
            genre_list += [g.strip() for g in m.genres.split(',') if g.strip()]
    genre_counter = Counter(genre_list)
    top_genre = genre_counter.most_common(1)[0] if genre_counter else ("", 0)

    # 가장 많이 선택된 태그
    groups = ReadingGroup.objects.filter(created_at__year=year, created_at__month=month)
    tag_list = []
    for g in groups:
        if g.tag:
            tag_list += [t.strip() for t in g.tag.split(',') if t.strip()]
    tag_counter = Counter(tag_list)
    top_tag = tag_counter.most_common(1)[0] if tag_counter else ("", 0)

    # 한 달 전체 교환독서 그룹 개설 수
    total_groups = groups.count()
    
    context = {'total_join': total_join,'top_genre': top_genre[0],'top_genre_count': top_genre[1],
               'top_tag': top_tag[0],'top_tag_count': top_tag[1],
        'total_groups': total_groups,'year': year,'month': month,}

    return render(request, 'gobookneews.html', context)

