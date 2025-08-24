// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EmpowerHer
 * @dev Decentralized platform for women's empowerment with content monetization
 * @notice Creators earn BDAG tokens based on views and engagement
 */
contract EmpowerHer is ReentrancyGuard, Ownable {
	using Counters for Counters.Counter;

	Counters.Counter private _contentIds;
	Counters.Counter private _courseIds;

	uint256 public constant PLATFORM_FEE = 200; // 2% (200/10000)
	uint256 public constant FEE_DENOMINATOR = 10000;
	uint256 public paymentPerView = 1000000000000000; // 0.001 BDAG

	struct Content {
		uint256 id;
		address creator;
		string title;
		string description;
		string ipfsHash;
		uint256 views;
		uint256 likes;
		uint256 earnings;
		uint256 category;
		uint256 timestamp;
		bool isActive;
	}

	struct Course {
		uint256 id;
		address instructor;
		string title;
		string description;
		string ipfsHash;
		uint256 duration;
		uint256 enrolledCount;
		bool isActive;
		uint256 timestamp;
	}

	struct Creator {
		uint256 totalViews;
		uint256 totalEarnings;
		uint256 contentCount;
		bool isVerified;
		string profileIpfsHash;
	}

	struct Student {
		uint256[] enrolledCourses;
		uint256[] completedCourses;
		mapping(uint256 => bool) hasCertificate;
	}

	mapping(uint256 => Content) public contents;
	mapping(uint256 => Course) public courses;
	mapping(address => Creator) public creators;
	mapping(address => Student) private students;
	mapping(address => uint256) public pendingWithdrawals;
	mapping(uint256 => mapping(address => bool)) public hasLiked;
	mapping(uint256 => mapping(address => bool)) public hasViewed;
	mapping(uint256 => mapping(address => bool)) public courseEnrollments;
	mapping(uint256 => mapping(address => bool)) public courseCompletions;

	uint256[] public activeContentIds;
	uint256[] public activeCourseIds;

	uint256 public adRevenuePool;
	uint256 public totalPlatformFees;

	event ContentUploaded(uint256 indexed contentId, address indexed creator, string title);
	event ContentViewed(uint256 indexed contentId, address indexed viewer);
	event ContentLiked(uint256 indexed contentId, address indexed liker);
	event EarningsWithdrawn(address indexed creator, uint256 amount);
	event CourseCreated(uint256 indexed courseId, address indexed instructor, string title);
	event CourseEnrolled(uint256 indexed courseId, address indexed student);
	event CourseCompleted(uint256 indexed courseId, address indexed student);
	event AdRevenueAdded(uint256 amount);
	event CreatorVerified(address indexed creator);

	constructor() {}

	modifier onlyCreator(uint256 _contentId) {
		require(contents[_contentId].creator == msg.sender, "Not the content creator");
		_;
	}

	modifier onlyInstructor(uint256 _courseId) {
		require(courses[_courseId].instructor == msg.sender, "Not the course instructor");
		_;
	}

	modifier contentExists(uint256 _contentId) {
		require(_contentId > 0 && _contentId <= _contentIds.current(), "Content does not exist");
		require(contents[_contentId].isActive, "Content is not active");
		_;
	}

	modifier courseExists(uint256 _courseId) {
		require(_courseId > 0 && _courseId <= _courseIds.current(), "Course does not exist");
		require(courses[_courseId].isActive, "Course is not active");
		_;
	}

	function uploadContent(string memory _title, string memory _description, string memory _ipfsHash, uint256 _category) external {
		require(bytes(_title).length > 0, "Title cannot be empty");
		require(bytes(_description).length > 0, "Description cannot be empty");
		require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
		require(_category < 10, "Invalid category");

		_contentIds.increment();
		uint256 newContentId = _contentIds.current();

		contents[newContentId] = Content({
			id: newContentId,
			creator: msg.sender,
			title: _title,
			description: _description,
			ipfsHash: _ipfsHash,
			views: 0,
			likes: 0,
			earnings: 0,
			category: _category,
			timestamp: block.timestamp,
			isActive: true
		});

		activeContentIds.push(newContentId);
		creators[msg.sender].contentCount++;

		emit ContentUploaded(newContentId, msg.sender, _title);
	}

	function viewContent(uint256 _contentId) external payable contentExists(_contentId) {
		require(!hasViewed[_contentId][msg.sender], "Already viewed this content");

		Content storage content = contents[_contentId];
		hasViewed[_contentId][msg.sender] = true;
		content.views++;
		creators[content.creator].totalViews++;

		uint256 payment = 0;
		if (adRevenuePool >= paymentPerView) {
			payment = paymentPerView;
			uint256 platformFee = (payment * PLATFORM_FEE) / FEE_DENOMINATOR;
			uint256 creatorPayment = payment - platformFee;

			content.earnings += creatorPayment;
			creators[content.creator].totalEarnings += creatorPayment;
			pendingWithdrawals[content.creator] += creatorPayment;

			adRevenuePool -= payment;
			totalPlatformFees += platformFee;
		}

		emit ContentViewed(_contentId, msg.sender);
	}

	function likeContent(uint256 _contentId) external contentExists(_contentId) {
		require(!hasLiked[_contentId][msg.sender], "Already liked this content");
		hasLiked[_contentId][msg.sender] = true;
		contents[_contentId].likes++;
		emit ContentLiked(_contentId, msg.sender);
	}

	function getContent(uint256 _contentId) external view returns (Content memory) {
		return contents[_contentId];
	}

	function getAllContent() external view returns (uint256[] memory) {
		return activeContentIds;
	}

	function getCreatorContent(address _creator) external view returns (uint256[] memory) {
		uint256[] memory creatorContent = new uint256[](creators[_creator].contentCount);
		uint256 index = 0;
		for (uint256 i = 0; i < activeContentIds.length; i++) {
			if (contents[activeContentIds[i]].creator == _creator) {
				creatorContent[index] = activeContentIds[i];
				index++;
			}
		}
		return creatorContent;
	}

	function createCourse(string memory _title, string memory _description, string memory _ipfsHash, uint256 _duration) external {
		require(bytes(_title).length > 0, "Title cannot be empty");
		require(bytes(_description).length > 0, "Description cannot be empty");
		require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
		require(_duration > 0, "Duration must be greater than 0");

		_courseIds.increment();
		uint256 newCourseId = _courseIds.current();

		courses[newCourseId] = Course({
			id: newCourseId,
			instructor: msg.sender,
			title: _title,
			description: _description,
			ipfsHash: _ipfsHash,
			duration: _duration,
			enrolledCount: 0,
			isActive: true,
			timestamp: block.timestamp
		});

		activeCourseIds.push(newCourseId);
		emit CourseCreated(newCourseId, msg.sender, _title);
	}

	function enrollInCourse(uint256 _courseId) external courseExists(_courseId) {
		require(!courseEnrollments[_courseId][msg.sender], "Already enrolled in this course");
		courseEnrollments[_courseId][msg.sender] = true;
		courses[_courseId].enrolledCount++;
		students[msg.sender].enrolledCourses.push(_courseId);
		emit CourseEnrolled(_courseId, msg.sender);
	}

	function completeCourse(uint256 _courseId) external courseExists(_courseId) {
		require(courseEnrollments[_courseId][msg.sender], "Not enrolled in this course");
		require(!courseCompletions[_courseId][msg.sender], "Already completed this course");
		courseCompletions[_courseId][msg.sender] = true;
		students[msg.sender].completedCourses.push(_courseId);
		students[msg.sender].hasCertificate[_courseId] = true;
		emit CourseCompleted(_courseId, msg.sender);
	}

	function getAllCourses() external view returns (uint256[] memory) {
		return activeCourseIds;
	}

	function hasCertificate(address _student, uint256 _courseId) external view returns (bool) {
		return students[_student].hasCertificate[_courseId];
	}

	function addAdRevenue() external payable {
		require(msg.value > 0, "Must send BDAG tokens");
		adRevenuePool += msg.value;
		emit AdRevenueAdded(msg.value);
	}

	function getCreatorEarnings(address _creator) external view returns (uint256) {
		return pendingWithdrawals[_creator];
	}

	function withdrawEarnings() external nonReentrant {
		uint256 amount = pendingWithdrawals[msg.sender];
		require(amount > 0, "No earnings to withdraw");
		pendingWithdrawals[msg.sender] = 0;
		(bool success, ) = payable(msg.sender).call{value: amount}("");
		require(success, "Withdrawal failed");
		emit EarningsWithdrawn(msg.sender, amount);
	}

	function emergencyWithdraw() external onlyOwner {
		uint256 balance = address(this).balance;
		require(balance > 0, "No funds to withdraw");
		(bool success, ) = payable(owner()).call{value: balance}("");
		require(success, "Emergency withdrawal failed");
	}

	function verifyCreator(address _creator) external onlyOwner {
		creators[_creator].isVerified = true;
		emit CreatorVerified(_creator);
	}

	function updatePaymentPerView(uint256 _newPayment) external onlyOwner {
		paymentPerView = _newPayment;
	}

	function deactivateContent(uint256 _contentId) external onlyOwner {
		require(_contentId <= _contentIds.current(), "Content does not exist");
		contents[_contentId].isActive = false;
	}

	function withdrawPlatformFees() external onlyOwner nonReentrant {
		uint256 amount = totalPlatformFees;
		require(amount > 0, "No platform fees to withdraw");
		totalPlatformFees = 0;
		(bool success, ) = payable(owner()).call{value: amount}("");
		require(success, "Platform fee withdrawal failed");
	}

	function getPlatformStats() external view returns (uint256 totalContent, uint256 totalCourses, uint256 totalViews, uint256 adPool, uint256 platformFees) {
		uint256 views = 0;
		for (uint256 i = 0; i < activeContentIds.length; i++) {
			views += contents[activeContentIds[i]].views;
		}
		return (_contentIds.current(), _courseIds.current(), views, adRevenuePool, totalPlatformFees);
	}

	function getCreatorProfile(address _creator) external view returns (Creator memory) {
		return creators[_creator];
	}

	function getStudentCourses(address _student) external view returns (uint256[] memory enrolled, uint256[] memory completed) {
		return (students[_student].enrolledCourses, students[_student].completedCourses);
	}

	receive() external payable {
		adRevenuePool += msg.value;
		emit AdRevenueAdded(msg.value);
	}
}


