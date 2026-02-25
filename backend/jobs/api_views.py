from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from .models import Jobs, JobApplication
from .serializers import JobListSerializer, JobDetailSerializer, JobApplicationSerializer, JobCreateSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def job_list(request):
    jobs = Jobs.objects.all().order_by("-is_featured", "-date")
    remote = request.query_params.get("remote")
    employment_type = request.query_params.get("employment_type")
    if remote is not None:
        jobs = jobs.filter(remote=(remote.lower() == "true"))
    if employment_type:
        jobs = jobs.filter(employment_type=employment_type)
    return Response(JobListSerializer(jobs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def job_detail(request, pk):
    try:
        job = Jobs.objects.get(pk=pk)
    except Jobs.DoesNotExist:
        return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(JobDetailSerializer(job).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def job_apply(request, pk):
    try:
        job = Jobs.objects.get(pk=pk)
    except Jobs.DoesNotExist:
        return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
    if JobApplication.objects.filter(job=job, applicant=request.user).exists():
        return Response({"detail": "Already applied."}, status=status.HTTP_400_BAD_REQUEST)
    application = JobApplication.objects.create(
        job=job,
        applicant=request.user,
        cover_note=request.data.get("cover_note", ""),
        speechef_score_at_apply=request.data.get("speechef_score"),
    )

    try:
        from users.badges import award_badge
        award_badge(request.user, 'first_job_apply')
    except Exception:
        pass

    return Response({"application_id": application.id}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def job_create(request):
    serializer = JobCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    job = serializer.save(posted_by=request.user)
    return Response({"job_id": job.id}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_applications(request):
    apps = JobApplication.objects.filter(applicant=request.user).order_by("-applied_at")
    return Response(JobApplicationSerializer(apps, many=True).data)
