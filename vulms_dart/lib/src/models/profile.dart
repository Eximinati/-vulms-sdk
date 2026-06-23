import 'package:freezed_annotation/freezed_annotation.dart';

part 'profile.freezed.dart';
part 'profile.g.dart';

/// Represents the student's VULMS profile.
@freezed
abstract class Profile with _$Profile {
  const factory Profile({
    String? studentId,
    String? name,
    String? email,
    String? program,
    String? session,
    String? imageUrl,
    Map<String, String>? additionalFields,
  }) = _Profile;

  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(json);
}
